import type { FocusEntryFunctions } from "components/system/Files/FileManager/useFocusableEntries";
import { useSession } from "contexts/session";
import { dirname, join } from "path";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Position } from "react-rnd";
import { MILLISECONDS_IN_SECOND, UNKNOWN_ICON } from "utils/constants";
import { getHtmlToImage, updateIconPositions } from "utils/functions";

type DraggableEntryProps = {
  draggable: boolean;
  onDragEnd: React.DragEventHandler;
  onDragStart: React.DragEventHandler;
  style: React.CSSProperties;
};

type DraggableEntry = (url: string, file: string) => DraggableEntryProps;

export type DragPosition = Partial<
  Position & { offsetX: number; offsetY: number }
>;

const useDraggableEntries = (
  focusedEntries: string[],
  { blurEntry, focusEntry }: FocusEntryFunctions,
  fileManagerRef: React.MutableRefObject<HTMLOListElement | null>,
  isSelecting: boolean,
  allowMoving?: boolean
): DraggableEntry => {
  const lastfileManagerChildRef = useRef<Element | null | undefined>(
    fileManagerRef.current?.lastElementChild
  );
  const [dropIndex, setDropIndex] = useState(-1);
  const { iconPositions, sortOrders, setIconPositions, setSortOrder } =
    useSession();
  const dragImageRef = useRef<HTMLImageElement | null>();
  const dragPositionRef = useRef<DragPosition>({});
  const draggedOnceRef = useRef(false);
  const onDragging = ({ clientX: x, clientY: y }: DragEvent): void => {
    dragPositionRef.current = { ...dragPositionRef.current, x, y };
  };
  const onDragEnd =
    (entryUrl: string): React.DragEventHandler =>
    () => {
      if (allowMoving && focusedEntries.length > 0) {
        updateIconPositions(
          entryUrl,
          fileManagerRef.current,
          iconPositions,
          sortOrders,
          dragPositionRef.current,
          focusedEntries,
          setIconPositions
        );
        fileManagerRef.current?.removeEventListener("dragover", onDragging);
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
        if (
          allowMoving &&
          !draggedOnceRef.current &&
          ((lastfileManagerChildRef.current &&
            fileManagerRef.current?.lastElementChild &&
            fileManagerRef.current.lastElementChild !==
              lastfileManagerChildRef.current) ||
            Object.keys(iconPositions).some((key) => dirname(key) === entryUrl))
        ) {
          draggedOnceRef.current = true;
        }

        event.dataTransfer.setDragImage(
          dragImageRef.current,
          "mozInputSource" in event.nativeEvent
            ? event.nativeEvent.clientX
            : event.nativeEvent.offsetX,
          draggedOnceRef.current
            ? event.nativeEvent.clientY
            : event.nativeEvent.offsetY
        );

        if (allowMoving && !draggedOnceRef.current) {
          draggedOnceRef.current = true;
        }
      }

      Object.assign(event.dataTransfer, { effectAllowed: "move" });

      if (allowMoving) {
        dragPositionRef.current =
          focusedEntries.length > 1
            ? {
                offsetX: event.nativeEvent.offsetX,
                offsetY: event.nativeEvent.offsetY,
              }
            : {};
        fileManagerRef.current?.addEventListener("dragover", onDragging, {
          passive: true,
        });
      }
    };
  const updateDragImage = useCallback(async () => {
    if (fileManagerRef.current) {
      const focusedElements = [
        ...fileManagerRef.current.querySelectorAll(".focus-within"),
      ];

      if (focusedElements.length > 1) {
        if (!dragImageRef.current) dragImageRef.current = new Image();

        const htmlToImage = await getHtmlToImage();

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
    if (
      fileManagerRef.current?.lastElementChild &&
      !lastfileManagerChildRef.current
    ) {
      lastfileManagerChildRef.current = fileManagerRef.current.lastElementChild;
    }
  }, [fileManagerRef, focusedEntries]);

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
    onDragEnd: onDragEnd(entryUrl),
    onDragOver: onDragOver(file),
    onDragStart: onDragStart(entryUrl, file),
    style: iconPositions[join(entryUrl, file)],
  });
};

export default useDraggableEntries;
