import { getShortcutInfo } from "components/system/Files/FileEntry/functions";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { useProcessesRef } from "hooks/useProcessesRef";
import { useEffect, useMemo, useRef } from "react";
import { PROCESS_DELIMITER, SHORTCUT_EXTENSION } from "utils/constants";
import { getExtension } from "utils/functions";

export type Operation = "Copying" | "Extracting" | "Moving";

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
    url?: string
  ) => Promise<void>;
};

const useTransferDialog = (): Dialog => {
  const { argument, open } = useProcesses();
  const processesRef = useProcessesRef();
  const { readFile } = useFileSystem();
  const getTransferIdCallbackRef =
    useRef<(url: string) => string | undefined>();

  useEffect(() => {
    getTransferIdCallbackRef.current = (url: string) =>
      Object.keys(processesRef.current).find((id) => {
        const [pid, pidUrl] = id.split(PROCESS_DELIMITER);

        return pid === "Transfer" && url === pidUrl;
      }) || "";
  }, [processesRef]);

  return useMemo(
    () => ({
      openTransferDialog: async (fileReaders, url) => {
        if (fileReaders?.length === 0) return;

        if (fileReaders && url) {
          const currentPid = getTransferIdCallbackRef.current?.(url);

          if (currentPid) {
            argument(currentPid, "fileReaders", fileReaders);
          }
        } else {
          if (fileReaders?.length === 1 && !Array.isArray(fileReaders[0])) {
            const [{ directory, name }] = fileReaders;

            if (getExtension(name) === SHORTCUT_EXTENSION) {
              const { url: shortcutUrl } = getShortcutInfo(
                await readFile(name)
              );

              if (shortcutUrl === directory) return;
            }
          }

          open("Transfer", { fileReaders, url });
        }
      },
    }),
    [argument, open, readFile]
  );
};

export default useTransferDialog;
