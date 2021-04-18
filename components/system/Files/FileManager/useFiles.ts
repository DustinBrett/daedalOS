import { useFileSystem } from 'contexts/fileSystem';
import { useCallback, useEffect, useState } from 'react';

type Files = {
  files: string[];
  updateFiles: (appendFile?: string) => void;
};

const useFiles = (directory: string): Files => {
  const [files, setFiles] = useState<string[]>([]);
  const { fs } = useFileSystem();
  const updateFiles = useCallback(
    (appendFile = '') =>
      fs?.readdir(directory, (_error, contents = []) =>
        setFiles((currentFiles) =>
          appendFile ? [...currentFiles, appendFile] : contents
        )
      ),
    [directory, fs]
  );

  useEffect(updateFiles, [updateFiles]);

  return {
    files,
    updateFiles
  };
};

export default useFiles;
