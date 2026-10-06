import { join } from "path";
import { useEffect, useRef } from "react";
import { type Position } from "react-rnd";
import type * as FileManagerIcons from "components/system/Files/FileManager/icons";
import { type FocusEntryFunctions } from "components/system/Files/FileManager/useFocusableEntries";
import { useFileSystemActions } from "contexts/fileSystem";
import {
  useIconPositions,
  useSessionActions,
  useSortOrder,
} from "contexts/session";
import { TRANSITIONS_IN_MILLISECONDS } from "utils/constants";
import {
  getHtmlToImage,
  getMimeType,
  haltEvent,
  shouldCaptureDragImage,
  trimCanvasToTopLeft,
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

const FILE_MANAGER_TOP_PADDING = 5;

const loadFileManagerIcons = (): Promise<typeof FileManagerIcons> =>
  import("components/system/Files/FileManager/icons");

const DRAG_IMAGE_CSS =
  "li { background-color: transparent !important; outline: none !important; }";

const useDraggableEntries = (
  directory: string,
  focusedEntries: string[],
  { focusEntry }: FocusEntryFunctions,
  fileManagerRef: React.RefObject<HTMLOListElement | null>,
  isSelecting: boolean,
  allowMoving?: boolean,
  isDesktop?: boolean
): DraggableEntry => {
  const { exists } = useFileSystemActions();
  const { setIconPositions } = useSessionActions();
  const iconPositions = useIconPositions();
  const [sortOrder] = useSortOrder(directory);
  const dragImageRef = useRef<HTMLImageElement>(null);
  const adjustedCaptureOffsetRef = useRef(false);
  const capturedImageOffset = useRef({ x: 0, y: 0 });
  const dragPositionRef = useRef<DragPosition>(
    Object.create(null) as DragPosition
  );
  const onDragging = ({ clientX: x, clientY: y }: DragEvent): void => {
    dragPositionRef.current = { ...dragPositionRef.current, x, y };
  };
  const updateDragImage = async (): Promise<void> => {
    if (fileManagerRef.current) {
      const focusedElements = [
        ...fileManagerRef.current.querySelectorAll<HTMLLIElement>(
          ".focus-within"
        ),
      ];

      if (shouldCaptureDragImage(focusedElements.length, isDesktop)) {
        if (dragImageRef.current) dragImageRef.current.src = "";
        else dragImageRef.current = new Image();

        const [htmlToImage, { UNKNOWN_ICON }] = await Promise.all([
          getHtmlToImage(),
          loadFileManagerIcons(),
        ]);

        if (!htmlToImage) return;

        try {
          const elementsHavePositions = focusedElements.every(
            ({ style }) => style?.gridRowStart && style?.gridColumnStart
          );
          const capturedFileManager = await htmlToImage.toCanvas(
            fileManagerRef.current,
            {
              filter: (element) =>
                !(element instanceof HTMLSourceElement) &&
                focusedElements.some((focusedElement) =>
                  focusedElement.contains(element)
                ),
              // Injected into the capture, overriding the cloned inline styles
              fontEmbedCSS: DRAG_IMAGE_CSS,
              imagePlaceholder: UNKNOWN_ICON,
              skipAutoScale: true,
            }
          );
          let trimmedCapture = capturedFileManager;

          if (elementsHavePositions) {
            trimmedCapture = trimCanvasToTopLeft(capturedFileManager);
          }

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
  };
  const onDragEnd =
    (entryUrl: string): React.DragEventHandler =>
    (event) => {
      haltEvent(event);

      if (allowMoving && focusedEntries.length > 0) {
        updateIconPositions(
          entryUrl,
          fileManagerRef.current,
          iconPositions,
          sortOrder,
          dragPositionRef.current,
          focusedEntries,
          setIconPositions,
          exists
        );

        fileManagerRef.current?.removeEventListener("dragover", onDragging);

        setTimeout(() => {
          adjustedCaptureOffsetRef.current = false;
          updateDragImage();
        }, TRANSITIONS_IN_MILLISECONDS.MOUSE_IN_OUT / 2);
      }
    };
  const onDragStart =
    (
      entryUrl: string,
      file: string,
      renaming: boolean
    ): React.DragEventHandler =>
    (event) => {
      if (renaming || "ontouchstart" in window) {
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
            window.location.origin
          }${encodeURI(join(entryUrl, file))}`
        );
      }

      if (
        dragImageRef.current &&
        shouldCaptureDragImage(focusedEntries.length, isDesktop)
      ) {
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
          isDesktop ? capturedImageOffset.current.x : event.nativeEvent.offsetX,
          isDesktop ? capturedImageOffset.current.y : event.nativeEvent.offsetY
        );
      } else {
        // Browser snapshots the entry after dragstart, so hide selection until then
        const { style } = event.currentTarget as HTMLElement;

        style.backgroundColor = "transparent";
        style.outline = "none";

        setTimeout(() => {
          style.backgroundColor = "";
          style.outline = "";
        }, 0);
      }

      Object.assign(event.dataTransfer, { effectAllowed: "move" });

      if (allowMoving) {
        dragPositionRef.current = shouldCaptureDragImage(
          focusedEntries.length,
          isDesktop
        )
          ? {
              offsetX: event.nativeEvent.offsetX,
              offsetY: event.nativeEvent.offsetY,
            }
          : (Object.create(null) as DragPosition);
        fileManagerRef.current?.addEventListener("dragover", onDragging, {
          passive: true,
        });
      }

      if (event.nativeEvent.dataTransfer) {
        // eslint-disable-next-line no-param-reassign
        event.nativeEvent.dataTransfer.effectAllowed = "move";
      }
    };

  useEffect(() => {
    if (
      !isSelecting &&
      shouldCaptureDragImage(focusedEntries.length, isDesktop)
    ) {
      updateDragImage();
    } else if (focusedEntries.length === 0) {
      adjustedCaptureOffsetRef.current = false;
    }
  }, [focusedEntries, isDesktop, isSelecting, updateDragImage]);

  return (entryUrl: string, file: string, renaming: boolean) => ({
    draggable: true,
    onDragEnd: onDragEnd(entryUrl),
    onDragStart: onDragStart(entryUrl, file, renaming),
    style: isDesktop ? iconPositions[join(entryUrl, file)] : undefined,
  });
};

export default useDraggableEntries;
