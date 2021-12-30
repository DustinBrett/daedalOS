import {
  haltEvent,
  handleFileInputEvent,
} from "components/system/Files/FileManager/functions";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import useDialog from "hooks/useDialog";
import { join } from "path";
import { DESKTOP_PATH } from "utils/constants";

type FileDrop = {
  onDragLeave?: (event: DragEvent | React.DragEvent<HTMLElement>) => void;
  onDragOver: (event: DragEvent | React.DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent | React.DragEvent<HTMLElement>) => void;
};

type FileDropProps = {
  callback?: (path: string, buffer?: Buffer) => void;
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
    fileData?: Buffer
  ): Promise<void> => {
    if (id) {
      if (!fileData) {
        url(id, filePath);
      } else {
        const tempPath = join(DESKTOP_PATH, filePath);

        await mkdirRecursive(DESKTOP_PATH);

        if (await writeFile(tempPath, fileData, true)) {
          url(id, tempPath);
          updateFolder(DESKTOP_PATH, filePath);
        }
      }
    }
  };
  const { openTransferDialog } = useDialog();

  return {
    onDragLeave,
    onDragOver: (event) => {
      onDragOver?.(event);
      haltEvent(event);
    },
    onDrop: (event) =>
      handleFileInputEvent(
        event,
        callback || updateProcessUrl,
        directory,
        openTransferDialog
      ),
  };
};

export default useFileDrop;
