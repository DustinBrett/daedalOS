import {
  haltEvent,
  handleFileInputEvent,
} from "components/system/Files/FileManager/functions";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { join } from "path";
import { TEMP_PATH } from "utils/constants";

type FileDrop = {
  onDragOver: (event: React.DragEvent<HTMLElement>) => void;
  onDrop: (event: React.DragEvent<HTMLElement>) => void;
};

type FileDropProps = {
  callback?: (path: string, buffer?: Buffer) => void;
  id?: string;
};

const useFileDrop = ({ callback, id }: FileDropProps): FileDrop => {
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
        const tempPath = join(TEMP_PATH, filePath);

        await mkdirRecursive(TEMP_PATH);

        if (await writeFile(tempPath, fileData, true)) {
          url(id, tempPath);
          updateFolder(TEMP_PATH, filePath);
        }
      }
    }
  };

  return {
    onDragOver: haltEvent,
    onDrop: (event) =>
      handleFileInputEvent(event, callback || updateProcessUrl),
  };
};

export default useFileDrop;
