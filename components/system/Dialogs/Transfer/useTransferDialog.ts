import { useProcesses } from "contexts/process";
import { useEffect, useMemo, useRef } from "react";
import { PROCESS_DELIMITER } from "utils/constants";

export type FileReaders = [File, string, FileReader][];

export type ObjectReaders = {
  abort: () => void;
  directory: string;
  done?: () => void;
  name: string;
  read: () => Promise<void>;
}[];

type Dialog = {
  openTransferDialog: (
    fileReaders?: FileReaders | ObjectReaders,
    url?: string
  ) => void;
};

const useTransferDialog = (): Dialog => {
  const { argument, open, processes } = useProcesses();
  const getTransferIdCallbackRef =
    useRef<(url: string) => string | undefined>();

  useEffect(() => {
    getTransferIdCallbackRef.current = (url: string) =>
      Object.keys(processes).find((id) => {
        const [pid, pidUrl] = id.split(PROCESS_DELIMITER);

        return pid === "Transfer" && url === pidUrl;
      }) || "";
  }, [processes]);

  return useMemo(
    () =>
      ({
        openTransferDialog: (fileReaders, url) => {
          if (fileReaders && url) {
            const currentPid = getTransferIdCallbackRef.current?.(url);

            if (currentPid) {
              argument(currentPid, "fileReaders", fileReaders);
            }
          } else {
            open("Transfer", { fileReaders, url });
          }
        },
      } as Dialog),
    [argument, open]
  );
};

export default useTransferDialog;
