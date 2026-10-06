import { basename, join, relative } from "path";
import useTransferDialog from "components/system/Dialogs/Transfer/useTransferDialog";
import {
  getEventData,
  handleFileInputEvent,
} from "components/system/Files/FileManager/functions";
import { type DragPosition } from "components/system/Files/FileManager/useDraggableEntries";
import {
  COMPLETE_ACTION,
  type CompleteAction,
  type NewPath,
} from "components/system/Files/FileManager/useFolder";
import { useFileSystemActions } from "contexts/fileSystem";
import { getProcess, useProcessesActions } from "contexts/process";
import {
  useIconPositions,
  useSessionActions,
  useSortOrder,
} from "contexts/session";
import {
  DESKTOP_PATH,
  MOUNTABLE_EXTENSIONS,
  PREVENT_SCROLL,
} from "utils/constants";
import {
  getExtension,
  getIteratedNames,
  haltEvent,
  updateIconPositions,
} from "utils/functions";

export type FileDrop = {
  onDragLeave?: (event: DragEvent | React.DragEvent<HTMLElement>) => void;
  onDragOver: (event: DragEvent | React.DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent | React.DragEvent<HTMLElement>) => void;
};

type FileDropProps = {
  callback?: NewPath;
  directory?: string;
  id?: string;
  onDragLeave?: (event: DragEvent | React.DragEvent<HTMLElement>) => void;
  onDragOver?: (event: DragEvent | React.DragEvent<HTMLElement>) => void;
  updatePositions?: boolean;
};

const useFileDrop = ({
  callback,
  directory = DESKTOP_PATH,
  id,
  onDragLeave,
  onDragOver,
  updatePositions,
}: FileDropProps): FileDrop => {
  const { url } = useProcessesActions();
  const { setIconPositions } = useSessionActions();
  const iconPositions = useIconPositions();
  const [sortOrder] = useSortOrder(directory);
  const { exists, mkdirRecursive, updateFolder, writeFile } =
    useFileSystemActions();
  const updateProcessUrl = async (
    filePath: string,
    fileData?: Buffer,
    completeAction?: CompleteAction
  ): Promise<string> => {
    if (id) {
      if (fileData) {
        const tempPath = join(DESKTOP_PATH, filePath);

        await mkdirRecursive(DESKTOP_PATH);

        if (await writeFile(tempPath, fileData, true)) {
          if (completeAction === COMPLETE_ACTION.UPDATE_URL) {
            url(id, tempPath);
          }
          updateFolder(DESKTOP_PATH, filePath);

          return basename(tempPath);
        }
      } else if (completeAction === COMPLETE_ACTION.UPDATE_URL) {
        url(id, filePath);
      }
    }

    return "";
  };
  const { openTransferDialog } = useTransferDialog();
  const onDragOverThenHaltEvent = (
    event: DragEvent | React.DragEvent<HTMLElement>
  ): void => {
    onDragOver?.(event);
    haltEvent(event);
  };
  const onDrop = (event: DragEvent | React.DragEvent<HTMLElement>): void => {
    if (MOUNTABLE_EXTENSIONS.has(getExtension(directory))) return;

    if (event.target instanceof HTMLElement) {
      if (event.target.closest(".focus-within")?.contains(event.target)) {
        return;
      }

      if (updatePositions) {
        const { files, text } = getEventData(event);

        if (files.length === 0 && text === "") return;

        const checkUpdatableIcons = async (): Promise<void> => {
          const dragPosition = {
            x: event.clientX,
            y: event.clientY,
          } as DragPosition;

          let fileEntries: string[] = [];

          if (text) {
            try {
              fileEntries = JSON.parse(text) as string[];
            } catch {
              // Ignore failed JSON parsing
            }

            if (!Array.isArray(fileEntries)) return;

            const [firstEntry] = fileEntries;

            if (!firstEntry) return;

            if (
              firstEntry.startsWith(directory) &&
              basename(firstEntry) === relative(directory, firstEntry)
            ) {
              return;
            }

            fileEntries = fileEntries.map((entry) => basename(entry));
          } else if (files instanceof FileList) {
            fileEntries = [...files].map((file) => file.name);
          } else {
            fileEntries = [...files]
              .map((file) => file.getAsFile()?.name || "")
              .filter(Boolean);
          }

          fileEntries = await getIteratedNames(
            fileEntries,
            directory,
            iconPositions,
            exists
          );

          updateIconPositions(
            directory,
            event.target as HTMLElement,
            iconPositions,
            sortOrder,
            dragPosition,
            fileEntries,
            setIconPositions,
            exists
          );
        };

        checkUpdatableIcons();
      }
    }

    const hasUpdateId = typeof id === "string";

    if (hasUpdateId && !updatePositions && directory === DESKTOP_PATH) {
      getProcess(id)?.componentWindow?.focus(PREVENT_SCROLL);
    }

    handleFileInputEvent(
      event as React.DragEvent,
      callback || updateProcessUrl,
      directory,
      openTransferDialog,
      hasUpdateId
    );
  };

  return {
    onDragLeave,
    onDragOver: onDragOverThenHaltEvent,
    onDrop,
  };
};

export default useFileDrop;
