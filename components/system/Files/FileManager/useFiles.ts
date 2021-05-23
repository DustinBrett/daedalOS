import { useFileSystem } from 'contexts/fileSystem';
import { basename } from 'path';
import { useCallback, useEffect, useState } from 'react';

type Files = {
  deleteFile: (path: string) => void;
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
          appendFile ? [...currentFiles, basename(appendFile)] : contents
        )
      ),
    [directory, fs]
  );
  const deleteFile = useCallback(
    (path: string) =>
      fs?.unlink(path, () =>
        setFiles((currentFiles) =>
          currentFiles.filter((file) => file !== basename(path))
        )
      ),
    [fs]
  );

  useEffect(updateFiles, [updateFiles]);

  return {
    deleteFile,
    files,
    updateFiles
  };
};

export default useFiles;
