import type { FocusEntryFunctions } from "components/system/Files/FileManager/useFocusableEntries";
import { useSession } from "contexts/session";
import { join } from "path";
import { useCallback, useEffect, useRef, useState } from "react";

type DraggableEntryProps = {
  draggable: boolean;
  onDragStart: React.DragEventHandler;
  onDragEnd: React.DragEventHandler;
};

type DraggableEntry = (url: string, file: string) => DraggableEntryProps;

const useDraggableEntries = (
  focusedEntries: string[],
  { blurEntry, focusEntry }: FocusEntryFunctions,
  fileManagerRef: React.MutableRefObject<HTMLOListElement | null>
): DraggableEntry => {
  const [dropIndex, setDropIndex] = useState(-1);
  const { setSortOrders } = useSession();
  const dragImageRef = useRef<HTMLImageElement | null>();
  const onDragEnd =
    (entryUrl: string): React.DragEventHandler =>
    () => {
      if (dropIndex !== -1) {
        setSortOrders((currentSortOrders) => {
          const sortedEntries = currentSortOrders[entryUrl].filter(
            (entry) => !focusedEntries.includes(entry)
          );

          sortedEntries.splice(dropIndex, 0, ...focusedEntries);

          return {
            ...currentSortOrders,
            [entryUrl]: sortedEntries,
          };
        });
      }

      blurEntry();
    };
  const onDragOver =
    (file: string): React.DragEventHandler =>
    ({ target }) => {
      if (target instanceof HTMLLIElement) {
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
            filter: (element) =>
              focusedElements.some((focusedElement) =>
                focusedElement.contains(element)
              ),
            skipAutoScale: true,
          }
        );
      }
    }
  }, [fileManagerRef]);

  useEffect(() => {
    updateDragImage();
  }, [focusedEntries, updateDragImage]);

  return (entryUrl: string, file: string) => ({
    draggable: true,
    onDragEnd: onDragEnd(entryUrl),
    onDragOver: onDragOver(file),
    onDragStart: onDragStart(entryUrl, file),
  });
};

export default useDraggableEntries;
