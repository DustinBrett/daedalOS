import type { FocusEntryFunctions } from "components/system/Files/FileManager/useFocusableEntries";
import { useSession } from "contexts/session";
import { join } from "path";
import { useCallback, useEffect, useRef, useState } from "react";
import { MILLISECONDS_IN_SECOND, UNKNOWN_ICON } from "utils/constants";
import {
  calcGridDropPosition,
  updateIconPositionsIfEmpty,
} from "utils/functions";

type DraggableEntryProps = {
  draggable: boolean;
  onDragEnd: React.DragEventHandler;
  onDragStart: React.DragEventHandler;
  style: React.CSSProperties;
};

type DraggableEntry = (url: string, file: string) => DraggableEntryProps;

const useDraggableEntries = (
  focusedEntries: string[],
  { blurEntry, focusEntry }: FocusEntryFunctions,
  fileManagerRef: React.MutableRefObject<HTMLOListElement | null>,
  isSelecting: boolean,
  allowMoving?: boolean
): DraggableEntry => {
  const [dropIndex, setDropIndex] = useState(-1);
  const { iconPositions, sortOrders, setIconPositions, setSortOrder } =
    useSession();
  const dragImageRef = useRef<HTMLImageElement | null>();
  const onDragEnd =
    (entryUrl: string, file: string): React.DragEventHandler =>
    ({ clientX, clientY }) => {
      if (allowMoving) {
        const currentIconPositions = updateIconPositionsIfEmpty(
          entryUrl,
          fileManagerRef.current,
          iconPositions,
          sortOrders
        );
        const gridDropPosition = calcGridDropPosition(
          fileManagerRef.current,
          clientX,
          clientY
        );

        if (
          !Object.values(currentIconPositions).some(
            ({ gridColumnStart, gridRowStart }) =>
              gridColumnStart === gridDropPosition.gridColumnStart &&
              gridRowStart === gridDropPosition.gridRowStart
          )
        ) {
          setIconPositions({
            ...currentIconPositions,
            [join(entryUrl, file)]: gridDropPosition,
          });
        }
      } else if (dropIndex !== -1) {
        setSortOrder(entryUrl, (currentSortOrders) => {
          const sortedEntries = currentSortOrders.filter(
            (entry) => !focusedEntries.includes(entry)
          );

          sortedEntries.splice(dropIndex, 0, ...focusedEntries);

          return sortedEntries;
        });
      }

      blurEntry();
    };
  const onDragOver =
    (file: string): React.DragEventHandler =>
    ({ target }) => {
      if (!allowMoving && target instanceof HTMLLIElement) {
        const { children = [] } = target.parentElement || {};
        const dragOverFocused = focusedEntries.includes(file);

        setDropIndex(dragOverFocused ? -1 : [...children].indexOf(target));
      }
    };
  const onDragStart =
    (entryUrl: string, file: string): React.DragEventHandler =>
    (event) => {
      focusEntry(file);
      event.dataTransfer.setData(
        "text/plain",
        JSON.stringify(
          focusedEntries.length <= 1
            ? [join(entryUrl, file)]
            : focusedEntries.map((entryFile) => join(entryUrl, entryFile))
        )
      );

      if (focusedEntries.length > 1 && dragImageRef.current) {
        event.dataTransfer.setDragImage(dragImageRef.current, 0, 0);
      }

      Object.assign(event.dataTransfer, { effectAllowed: "move" });
    };
  const updateDragImage = useCallback(async () => {
    if (fileManagerRef.current) {
      const focusedElements = [
        ...fileManagerRef.current.querySelectorAll(".focus-within"),
      ];

      if (focusedElements.length > 1) {
        if (!dragImageRef.current) dragImageRef.current = new Image();

        const htmlToImage = await import("html-to-image");

        dragImageRef.current.src = await htmlToImage.toPng(
          fileManagerRef.current,
          {
            filter: (element) => {
              return (
                !(element instanceof HTMLSourceElement) &&
                focusedElements.some((focusedElement) =>
                  focusedElement.contains(element)
                )
              );
            },
            imagePlaceholder: UNKNOWN_ICON,
            skipAutoScale: true,
          }
        );
      }
    }
  }, [fileManagerRef]);
  const debounceTimer = useRef<number>();

  useEffect(() => {
    if (debounceTimer.current) window.clearTimeout(debounceTimer.current);

    debounceTimer.current = window.setTimeout(() => {
      debounceTimer.current = undefined;
      updateDragImage();
    }, MILLISECONDS_IN_SECOND / 2);
  }, [focusedEntries, updateDragImage]);

  useEffect(() => {
    if (!isSelecting && focusedEntries.length > 1) {
      updateDragImage();
    }
  }, [focusedEntries.length, isSelecting, updateDragImage]);

  return (entryUrl: string, file: string) => ({
    draggable: true,
    onDragEnd: onDragEnd(entryUrl, file),
    onDragOver: onDragOver(file),
    onDragStart: onDragStart(entryUrl, file),
    style: iconPositions[join(entryUrl, file)],
  });
};

export default useDraggableEntries;
