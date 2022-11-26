import useTransferDialog from "components/system/Dialogs/Transfer/useTransferDialog";
import {
  getEventData,
  handleFileInputEvent,
} from "components/system/Files/FileManager/functions";
import type { DragPosition } from "components/system/Files/FileManager/useDraggableEntries";
import type { CompleteAction } from "components/system/Files/FileManager/useFolder";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { basename, extname, join, relative } from "path";
import { useCallback } from "react";
import { DESKTOP_PATH } from "utils/constants";
import { haltEvent, updateIconPositions } from "utils/functions";

type FileDrop = {
  onDragLeave?: (event: DragEvent | React.DragEvent<HTMLElement>) => void;
  onDragOver: (event: DragEvent | React.DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent | React.DragEvent<HTMLElement>) => void;
};

type FileDropProps = {
  callback?: (path: string, buffer?: Buffer) => Promise<void> | void;
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
  const { url } = useProcesses();
  const { iconPositions, sortOrders, setIconPositions } = useSession();
  const { mkdirRecursive, updateFolder, writeFile } = useFileSystem();
  const updateProcessUrl = useCallback(
    async (
      filePath: string,
      fileData?: Buffer,
      completeAction?: CompleteAction
    ): Promise<void> => {
      if (id) {
        if (fileData) {
          const tempPath = join(DESKTOP_PATH, filePath);

          await mkdirRecursive(DESKTOP_PATH);

          if (await writeFile(tempPath, fileData, true)) {
            if (completeAction === "updateUrl") url(id, tempPath);
            updateFolder(DESKTOP_PATH, filePath);
          }
        } else if (completeAction === "updateUrl") {
          url(id, filePath);
        }
      }
    },
    [id, mkdirRecursive, updateFolder, url, writeFile]
  );
  const { openTransferDialog } = useTransferDialog();

  return {
    onDragLeave,
    onDragOver: (event) => {
      onDragOver?.(event);
      haltEvent(event);
    },
    onDrop: (event) => {
      if (updatePositions && event.target instanceof HTMLElement) {
        const { files, text } = getEventData(event as React.DragEvent);

        if (files.length === 0 && text === "") return;

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

          if (fileEntries.length === 0) return;

          if (
            fileEntries[0].startsWith(directory) &&
            basename(fileEntries[0]) === relative(directory, fileEntries[0])
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

        fileEntries = fileEntries.map((fileEntry) => {
          if (!iconPositions[`${directory}/${fileEntry}`]) return fileEntry;

          let iteration = 0;
          let entryIteration = "";

          do {
            iteration += 1;
            entryIteration = `${directory}/${basename(
              fileEntry,
              extname(fileEntry)
            )} (${iteration})${extname(fileEntry)}`;
          } while (iconPositions[entryIteration]);

          return basename(entryIteration);
        });

        updateIconPositions(
          directory,
          event.target,
          iconPositions,
          sortOrders,
          dragPosition,
          fileEntries,
          setIconPositions
        );
      }

      handleFileInputEvent(
        event as React.DragEvent,
        callback || updateProcessUrl,
        directory,
        openTransferDialog
      );
    },
  };
};

export default useFileDrop;
