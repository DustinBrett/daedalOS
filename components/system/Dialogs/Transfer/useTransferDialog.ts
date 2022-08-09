import { useProcesses } from "contexts/process";

export type FileReaders = [File, string, FileReader][];

type Dialog = {
  openTransferDialog: (fileReaders: FileReaders) => void;
};

const useDialog = (): Dialog => {
  const { open } = useProcesses();

  return {
    openTransferDialog: (fileReaders: FileReaders) => {
      open("Transfer", { fileReaders, url: "" });
    },
  };
};

export default useDialog;
