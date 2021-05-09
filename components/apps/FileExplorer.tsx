import FileManager from 'components/system/Files/FileManager';
import type { ProcessComponentProps } from 'components/system/Processes/RenderProcess';
import { useProcesses } from 'contexts/process';
import { useEffect } from 'react';

const FileExplorer = ({ id }: ProcessComponentProps): JSX.Element => {
  const {
    title,
    processes: { [id]: { url = '' } = {} }
  } = useProcesses();
  useEffect(() => {
    if (url) {
      title(id, url);
    }
  }, [id, url, title]);

  return url ? <FileManager directory={url} /> : <></>;
};

export default FileExplorer;
