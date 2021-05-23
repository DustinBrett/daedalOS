import { useFileSystem } from 'contexts/fileSystem';
import { basename, extname } from 'path';
import { useCallback, useEffect, useState } from 'react';

type Files = {
  deleteFile: (path: string) => void;
  files: string[];
  renameFile: (path: string, name?: string) => void;
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
  const renameFile = useCallback(
    (path: string, name?: string) => {
      if (name) {
        const newPath = `${directory}/${name}${extname(path)}`;

        fs?.rename(path, newPath, () =>
          setFiles((currentFiles) =>
            currentFiles.map((file) =>
              file.replace(basename(path), basename(newPath))
            )
          )
        );
      }
    },
    [directory, fs]
  );

  useEffect(updateFiles, [updateFiles]);

  return {
    deleteFile,
    files,
    renameFile,
    updateFiles
  };
};

export default useFiles;
