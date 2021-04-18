import FileManager from 'components/system/Files/FileManager';
import type { ProcessComponentProps } from 'components/system/Processes/RenderProcess';
import { useProcesses } from 'contexts/process';

const FileExplorer = ({ id }: ProcessComponentProps): JSX.Element => {
  const {
    processes: {
      [id]: { url }
    }
  } = useProcesses();

  return <FileManager directory={url || '/'} />;
};

export default FileExplorer;
