import { useProcessesActions } from "contexts/process";
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
  const { title } = useProcessesActions();
  const [pid] = id.split(PROCESS_DELIMITER);
  const { title: originalTitle } = processDirectory[pid] || {};
  const appendFileToTitle = (url: string, unSaved?: boolean): void => {
    const appendedFile = url
      ? ` - ${url}${unSaved ? ` ${SAVE_TITLE_CHAR}` : ""}`
      : "";

    title(id, `${originalTitle}${appendedFile}`);
  };
  const prependFileToTitle = (
    url: string,
    unSaved?: boolean,
    withoutDash?: boolean
  ): void => {
    const prependedFile = url
      ? `${unSaved ? `${SAVE_TITLE_CHAR} ` : ""}${url}${
          withoutDash ? " " : " - "
        }`
      : "";

    title(id, `${prependedFile}${originalTitle}`);
  };

  return {
    appendFileToTitle,
    prependFileToTitle,
  };
};

export default useTitle;
