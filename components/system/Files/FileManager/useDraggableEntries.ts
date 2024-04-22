import { join } from "path";
import { type Position } from "react-rnd";
import { useCallback, useEffect, useRef, useState } from "react";
import { getMimeType } from "components/system/Files/FileEntry/functions";
import { type FocusEntryFunctions } from "components/system/Files/FileManager/useFocusableEntries";
import { useSession } from "contexts/session";
import {
  getHtmlToImage,
  haltEvent,
  trimCanvasToTopLeft,
  updateIconPositions,
} from "utils/functions";
import { useFileSystem } from "contexts/fileSystem";

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

const FILE_MANAGER_TOP_PADDING = 5;

const useDraggableEntries = (
  focusedEntries: string[],
  { focusEntry }: FocusEntryFunctions,
  fileManagerRef: React.MutableRefObject<HTMLOListElement | null>,
  isSelecting: boolean,
  allowMoving?: boolean
): DraggableEntry => {
  const [dropIndex, setDropIndex] = useState(-1);
  const { exists } = useFileSystem();
  const { iconPositions, sortOrders, setIconPositions, setSortOrder } =
    useSession();
  const dragImageRef = useRef<HTMLImageElement | null>();
  const adjustedCaptureOffsetRef = useRef(false);
  const capturedImageOffset = useRef({ x: 0, y: 0 });
  const dragPositionRef = useRef<DragPosition>(
    Object.create(null) as DragPosition
  );
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
          setIconPositions,
          exists
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

      const singleFile = focusedEntries.length <= 1;

      event.nativeEvent.dataTransfer?.setData(
        "application/json",
        JSON.stringify(
          singleFile
            ? [join(entryUrl, file)]
            : focusedEntries.map((entryFile) => join(entryUrl, entryFile))
        )
      );

      if (singleFile) {
        event.nativeEvent.dataTransfer?.setData(
          "DownloadURL",
          `${getMimeType(file) || "application/octet-stream"}:${file}:${
            window.location.href
          }${join(entryUrl, file)}`
        );
      }

      if (!singleFile && dragImageRef.current) {
        if (!adjustedCaptureOffsetRef.current) {
          adjustedCaptureOffsetRef.current = true;

          const hasCapturedImageOffset =
            capturedImageOffset.current.x || capturedImageOffset.current.y;

          capturedImageOffset.current = {
            x: hasCapturedImageOffset
              ? event.nativeEvent.clientX - capturedImageOffset.current.x
              : event.nativeEvent.offsetX,
            y: hasCapturedImageOffset
              ? event.nativeEvent.clientY - capturedImageOffset.current.y
              : event.nativeEvent.offsetY + FILE_MANAGER_TOP_PADDING,
          };
        }

        event.nativeEvent.dataTransfer?.setDragImage(
          dragImageRef.current,
          isMainContainer
            ? capturedImageOffset.current.x
            : event.nativeEvent.offsetX,
          isMainContainer
            ? capturedImageOffset.current.y
            : event.nativeEvent.offsetY
        );
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
        ...fileManagerRef.current.querySelectorAll<HTMLLIElement>(
          ".focus-within"
        ),
      ];

      if (focusedElements.length > 1) {
        if (dragImageRef.current) dragImageRef.current.src = "";
        else dragImageRef.current = new Image();

        const htmlToImage = await getHtmlToImage();

        if (!htmlToImage) return;

        try {
          const { UNKNOWN_ICON } = await import(
            "components/system/Files/FileManager/icons"
          );
          const elementsHavePositions = focusedElements.every(
            ({ style }) => style?.gridRowStart && style?.gridColumnStart
          );
          const capturedFileManager = await htmlToImage?.toCanvas(
            fileManagerRef.current,
            {
              filter: (element) =>
                !(element instanceof HTMLSourceElement) &&
                focusedElements.some((focusedElement) =>
                  focusedElement.contains(element)
                ),
              imagePlaceholder: UNKNOWN_ICON,
              skipAutoScale: true,
            }
          );
          const trimmedCapture = elementsHavePositions
            ? trimCanvasToTopLeft(capturedFileManager)
            : capturedFileManager;

          dragImageRef.current.src = trimmedCapture.toDataURL();
          capturedImageOffset.current = {
            x: capturedFileManager.width - trimmedCapture.width,
            y: capturedFileManager.height - trimmedCapture.height,
          };
        } catch {
          // Ignore failure to capture
        }
      }
    }
  }, [fileManagerRef]);

  useEffect(() => {
    if (!isSelecting && focusedEntries.length > 1) updateDragImage();
    else if (focusedEntries.length === 0) {
      adjustedCaptureOffsetRef.current = false;
    }
  }, [focusedEntries, isSelecting, updateDragImage]);

  return (entryUrl: string, file: string, renaming: boolean) => ({
    draggable: true,
    onDragEnd: onDragEnd(entryUrl),
    onDragOver: onDragOver(file),
    onDragStart: onDragStart(entryUrl, file, renaming),
    style: isMainContainer ? iconPositions[join(entryUrl, file)] : undefined,
  });
};

export default useDraggableEntries;
