import { useFileSystem } from 'contexts/fileSystem';
import { useEffect, useState } from 'react';

const useFiles = (
  directory: string,
  callback: (file: string) => JSX.Element
): JSX.Element[] => {
  const [files, setFiles] = useState<string[]>([]);
  const { fs } = useFileSystem();

  useEffect(() => {
    if (fs) {
      fs.readdir(directory, (_error, contents = []) => setFiles(contents));
    }
  }, [directory, fs]);

  return files.map(callback);
};

export default useFiles;
