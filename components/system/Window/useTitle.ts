import { useCallback, useMemo } from "react";
import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import { PROCESS_DELIMITER, SAVE_TITLE_CHAR } from "utils/constants";

type Title = {
  appendFileToTitle: (url: string, unSaved?: boolean) => void;
  prependFileToTitle: (
    url: string,
    unSaved?: boolean,
    withoutDash?: boolean
  ) => void;
};

const useTitle = (id: string): Title => {
  const { title } = useProcesses();
  const [pid] = useMemo(() => id.split(PROCESS_DELIMITER), [id]);
  const { title: originalTitle } = processDirectory[pid] || {};
  const appendFileToTitle = useCallback(
    (url: string, unSaved?: boolean) => {
      const appendedFile = url
        ? ` - ${url}${unSaved ? ` ${SAVE_TITLE_CHAR}` : ""}`
        : "";

      title(id, `${originalTitle}${appendedFile}`);
    },
    [id, originalTitle, title]
  );
  const prependFileToTitle = useCallback(
    (url: string, unSaved?: boolean, withoutDash?: boolean) => {
      const prependedFile = url
        ? `${unSaved ? `${SAVE_TITLE_CHAR} ` : ""}${url}${
            withoutDash ? " " : " - "
          }`
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
