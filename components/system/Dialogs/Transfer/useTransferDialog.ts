import { useMemo } from "react";
import { useFileSystemActions } from "contexts/fileSystem";
import { useProcessesActions, useProcessesRef } from "contexts/process";
import { PROCESS_DELIMITER, SHORTCUT_EXTENSION } from "utils/constants";
import { getExtension } from "utils/functions";

export type Operation = "Copying" | "Converting" | "Extracting" | "Moving";

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
  const processesRef = useProcessesRef();
  const { readFile: contextReadFile } = useFileSystemActions();
  // The file system provider uses this dialog above its own context, where
  // that context read yields nothing, so it passes its readFile directly
  const readFile = fsReadFile ?? contextReadFile;

  return useMemo(
    () => ({
      openTransferDialog: async (fileReaders, url, operation) => {
        if (fileReaders?.length === 0) return;

        if (fileReaders && url) {
          const currentPid = Object.keys(processesRef.current).find((id) => {
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
              const { getShortcutInfo } = await import(
                "components/system/Files/FileEntry/functions"
              );
              const { url: shortcutUrl } = getShortcutInfo(
                await readFile(name)
              );

              if (shortcutUrl === directory) return;
            }
          }

          open("Transfer", { fileReaders, operation, url });
        }
      },
    }),
    [argument, open, processesRef, readFile]
  );
};

export default useTransferDialog;
