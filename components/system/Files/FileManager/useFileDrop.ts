import useTransferDialog from "components/system/Dialogs/Transfer/useTransferDialog";
import { handleFileInputEvent } from "components/system/Files/FileManager/functions";
import type { CompleteAction } from "components/system/Files/FileManager/useFolder";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { join } from "path";
import { DESKTOP_PATH } from "utils/constants";
import { haltEvent } from "utils/functions";

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
};

const useFileDrop = ({
  callback,
  directory = DESKTOP_PATH,
  id,
  onDragLeave,
  onDragOver,
}: FileDropProps): FileDrop => {
  const { url } = useProcesses();
  const { mkdirRecursive, updateFolder, writeFile } = useFileSystem();
  const updateProcessUrl = async (
    filePath: string,
    fileData?: Buffer,
    completeAction?: CompleteAction
  ): Promise<void> => {
    if (id) {
      if (!fileData) {
        if (completeAction === "updateUrl") url(id, filePath);
      } else {
        const tempPath = join(DESKTOP_PATH, filePath);

        await mkdirRecursive(DESKTOP_PATH);

        if (await writeFile(tempPath, fileData, true)) {
          if (completeAction === "updateUrl") url(id, tempPath);
          updateFolder(DESKTOP_PATH, filePath);
        }
      }
    }
  };
  const { openTransferDialog } = useTransferDialog();

  return {
    onDragLeave,
    onDragOver: (event) => {
      onDragOver?.(event);
      haltEvent(event);
    },
    onDrop: (event) =>
      handleFileInputEvent(
        event as React.DragEvent,
        callback || updateProcessUrl,
        directory,
        openTransferDialog
      ),
  };
};

export default useFileDrop;
