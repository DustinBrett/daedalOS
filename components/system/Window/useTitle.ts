import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import { useCallback } from "react";
import { PROCESS_DELIMITER } from "utils/constants";

type Title = {
  appendFileToTitle: (url: string, unSaved?: boolean) => void;
  prependFileToTitle: (url: string, unSaved?: boolean) => void;
};

const SAVE_CHAR = "\u25CF";

const useTitle = (id: string): Title => {
  const { title } = useProcesses();
  const [pid] = id.split(PROCESS_DELIMITER);
  const { title: originalTitle } = processDirectory[pid] || {};
  const appendFileToTitle = useCallback(
    (url: string, unSaved?: boolean) => {
      const appendedFile = url
        ? ` - ${url}${unSaved ? ` ${SAVE_CHAR}` : ""}`
        : "";

      title(id, `${originalTitle}${appendedFile}`);
    },
    [id, originalTitle, title]
  );
  const prependFileToTitle = useCallback(
    (url: string, unSaved?: boolean) => {
      const prependedFile = url
        ? `${unSaved ? `${SAVE_CHAR} ` : ""}${url} - `
        : "";

      title(id, `${prependedFile}${originalTitle}`);
    },
    [id, originalTitle, title]
  );

  return {
    appendFileToTitle,
    prependFileToTitle,
  };
};

export default useTitle;
