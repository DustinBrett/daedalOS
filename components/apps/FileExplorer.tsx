import FileManager from 'components/system/Files/FileManager';
import type { ProcessComponentProps } from 'components/system/Processes/RenderProcess';
import { useProcesses } from 'contexts/process';
import { useEffect, useMemo } from 'react';

const FileExplorer = ({ id }: ProcessComponentProps): JSX.Element => {
  const {
    title,
    processes: {
      [id]: { url }
    }
  } = useProcesses();
  const path = useMemo(() => url || '/', [url]);

  useEffect(() => title(id, path), [id, path, title]);

  return <FileManager directory={path} />;
};

export default FileExplorer;
