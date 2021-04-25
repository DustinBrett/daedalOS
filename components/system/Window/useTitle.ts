import { useProcesses } from 'contexts/process';
import processDirectory from 'contexts/process/directory';
import { basename } from 'path';
import { useCallback } from 'react';
import { PROCESS_DELIMITER } from 'utils/constants';

type Title = {
  appendFileToTitle: (url: string) => void;
};

const useTitle = (id: string): Title => {
  const { title } = useProcesses();
  const [pid] = id.split(PROCESS_DELIMITER) || [];
  const { title: originalTitle } = processDirectory[pid] || {};
  const appendFileToTitle = useCallback(
    (url: string) => title(id, `${originalTitle} - ${basename(url)}`),
    [id, originalTitle, title]
  );

  return {
    appendFileToTitle
  };
};

export default useTitle;
