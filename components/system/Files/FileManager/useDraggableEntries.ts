import type { FocusEntryFunctions } from "components/system/Files/FileManager/useFocusableEntries";
import { useSession } from "contexts/session";
import { join } from "path";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Position } from "react-rnd";
import { MILLISECONDS_IN_SECOND, UNKNOWN_ICON } from "utils/constants";
import {
  getHtmlToImage,
  haltEvent,
  updateIconPositions,
} from "utils/functions";

type DraggableEntryProps = {
  draggable: boolean;
  onDragEnd: React.DragEventHandler;
  onDragStart: React.DragEventHandler;
  style?: React.CSSProperties;
};

type DraggableEntry = (
  url: string,
  file: string,
  renaming: boolean
) => DraggableEntryProps;

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
  const dragPositionRef = useRef<DragPosition>(
    Object.create(null) as DragPosition
  );
  const draggedOnceRef = useRef(false);
  const onDragging = ({ clientX: x, clientY: y }: DragEvent): void => {
    dragPositionRef.current = { ...dragPositionRef.current, x, y };
  };
  const isMainContainer =
    fileManagerRef.current?.parentElement?.tagName === "MAIN";
  const onDragEnd =
    (entryUrl: string): React.DragEventHandler =>
    (event) => {
      haltEvent(event);

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
    (
      entryUrl: string,
      file: string,
      renaming: boolean
    ): React.DragEventHandler =>
    (event) => {
      if (renaming) {
        haltEvent(event);
        return;
      }

      focusEntry(file);
      event.dataTransfer.setData(
        "application/json",
        JSON.stringify(
          focusedEntries.length <= 1
            ? [join(entryUrl, file)]
            : focusedEntries.map((entryFile) => join(entryUrl, entryFile))
        )
      );

      if (focusedEntries.length > 1 && dragImageRef.current) {
        const iconPositionKeys = Object.keys(iconPositions);

        if (
          allowMoving &&
          !draggedOnceRef.current &&
          ((lastfileManagerChildRef.current &&
            fileManagerRef.current?.lastElementChild &&
            fileManagerRef.current.lastElementChild !==
              lastfileManagerChildRef.current) ||
            focusedEntries.every((entryFile) =>
              iconPositionKeys.includes(`${entryUrl}/${entryFile}`)
            ))
        ) {
          draggedOnceRef.current = true;
        }

        const dragX = isMainContainer
          ? event.nativeEvent.clientX
          : event.nativeEvent.offsetX;
        const dragY = draggedOnceRef.current
          ? event.nativeEvent.clientY
          : event.nativeEvent.offsetY;

        event.dataTransfer.setDragImage(dragImageRef.current, dragX, dragY);

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
            : (Object.create(null) as DragPosition);
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
        if (dragImageRef.current) dragImageRef.current.src = "";
        else dragImageRef.current = new Image();

        const htmlToImage = await getHtmlToImage();
        const newDragImage = await htmlToImage?.toPng(fileManagerRef.current, {
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
        });

        if (newDragImage) {
          dragImageRef.current.src = newDragImage;
        }
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

  return (entryUrl: string, file: string, renaming: boolean) => ({
    draggable: true,
    onDragEnd: onDragEnd(entryUrl),
    onDragOver: onDragOver(file),
    onDragStart: onDragStart(entryUrl, file, renaming),
    style: isMainContainer ? iconPositions[join(entryUrl, file)] : undefined,
  });
};

export default useDraggableEntries;
