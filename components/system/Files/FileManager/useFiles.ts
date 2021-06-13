import { useFileSystem } from 'contexts/fileSystem';
import { basename, extname } from 'path';
import { useEffect, useState } from 'react';

type Files = {
  deleteFile: (path: string) => void;
  files: string[];
  renameFile: (path: string, name?: string) => void;
  updateFiles: (appendFile?: string) => void;
};

const useFiles = (directory: string): Files => {
  const [files, setFiles] = useState<string[]>([]);
  const { fs } = useFileSystem();
  const updateFiles = (appendFile = '') =>
    fs?.readdir(directory, (_error, contents = []) =>
      setFiles((currentFiles) =>
        appendFile ? [...currentFiles, basename(appendFile)] : contents
      )
    );
  const deleteFile = (path: string) =>
    fs?.unlink(path, () =>
      setFiles((currentFiles) =>
        currentFiles.filter((file) => file !== basename(path))
      )
    );
  const renameFile = (path: string, name?: string) => {
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
  };

  useEffect(updateFiles, [directory, fs]);

  return {
    deleteFile,
    files,
    renameFile,
    updateFiles
  };
};

export default useFiles;
