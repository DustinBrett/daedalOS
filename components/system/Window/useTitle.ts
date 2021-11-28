import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import { basename } from "path";
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
    (url: string, unSaved?: boolean) =>
      title(
        id,
        `${originalTitle} - ${basename(url)}${unSaved ? ` ${SAVE_CHAR}` : ""}`
      ),
    [id, originalTitle, title]
  );
  const prependFileToTitle = useCallback(
    (url: string, unSaved?: boolean) =>
      title(
        id,
        `${unSaved ? `${SAVE_CHAR} ` : ""}${basename(url)} - ${originalTitle}`
      ),
    [id, originalTitle, title]
  );

  return {
    appendFileToTitle,
    prependFileToTitle,
  };
};

export default useTitle;
