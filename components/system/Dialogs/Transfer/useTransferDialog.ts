import type * as FileEntryFunctions from "components/system/Files/FileEntry/functions";
import { useFileSystemActions } from "contexts/fileSystem";
import { getProcesses, useProcessesActions } from "contexts/process";
import { PROCESS_DELIMITER, SHORTCUT_EXTENSION } from "utils/constants";
import { getExtension } from "utils/functions";

export type Operation = "Converting" | "Copying" | "Extracting" | "Moving";

export type FileReaders = [File, string, FileReader][];

export type ObjectReader = {
  abort: () => void;
  directory: string;
  done?: () => void;
  name: string;
  operation: Operation;
  read: () => Promise<void>;
};

export type ObjectReaders = ObjectReader[];

const loadFileEntryFunctions = (): Promise<typeof FileEntryFunctions> =>
  import("components/system/Files/FileEntry/functions");

type Dialog = {
  openTransferDialog: (
    fileReaders?: FileReaders | ObjectReaders,
    url?: string,
    operation?: Operation
  ) => Promise<void>;
};

const useTransferDialog = (
  fsReadFile?: (path: string) => Promise<Buffer>
): Dialog => {
  const { argument, open } = useProcessesActions();
  const { readFile: contextReadFile } = useFileSystemActions();
  // The file system provider uses this dialog above its own context, where
  // that context read yields nothing, so it passes its readFile directly
  const readFile = fsReadFile ?? contextReadFile;

  return {
    openTransferDialog: async (fileReaders, url, operation) => {
      if (fileReaders?.length === 0) return;

      if (fileReaders && url) {
        const currentPid = Object.keys(getProcesses()).find((id) => {
          const [pid, pidUrl] = id.split(PROCESS_DELIMITER);

          return pid === "Transfer" && url === pidUrl;
        });

        if (currentPid) {
          argument(currentPid, "fileReaders", fileReaders);
        }
      } else {
        if (fileReaders?.length === 1 && !Array.isArray(fileReaders[0])) {
          const [{ directory, name }] = fileReaders;

          if (getExtension(name) === SHORTCUT_EXTENSION) {
            const { getShortcutInfo } = await loadFileEntryFunctions();
            const { url: shortcutUrl } = getShortcutInfo(await readFile(name));

            if (shortcutUrl === directory) return;
          }
        }

        open("Transfer", { fileReaders, operation, url });
      }
    },
  };
};

export default useTransferDialog;
