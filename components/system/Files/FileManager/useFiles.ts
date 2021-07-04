import { useFileSystem } from "contexts/fileSystem";
import { basename } from "path";
import { useCallback, useEffect, useState } from "react";
import { SHORTCUT_EXTENSION } from "utils/constants";
import { bufferToUrl, cleanUpBufferUrl } from "utils/functions";

export type FileActions = {
  deleteFile: (path: string) => void;
  downloadFile: (path: string) => void;
  renameFile: (path: string, name?: string) => void;
};

type Files = {
  fileActions: FileActions;
  files: string[];
  updateFiles: (appendFile?: string) => void;
};

const useFiles = (directory: string): Files => {
  const [files, setFiles] = useState<string[]>([]);
  const [downloadLink, setDownloadLink] = useState<string>("");
  const { fs } = useFileSystem();
  const updateFiles = useCallback(
    (appendFile = "") =>
      fs?.readdir(directory, (_error, contents = []) =>
        setFiles((currentFiles) =>
          appendFile ? [...currentFiles, basename(appendFile)] : contents
        )
      ),
    [directory, fs]
  );
  const deleteFile = (path: string) =>
    fs?.unlink(path, () =>
      setFiles((currentFiles) =>
        currentFiles.filter((file) => file !== basename(path))
      )
    );
  const downloadFile = (path: string) =>
    fs?.readFile(path, (_error, contents = Buffer.from("")) => {
      const link = document.createElement("a");

      link.href = bufferToUrl(contents);
      link.download = basename(path);

      link.click();

      setDownloadLink(link.href);
    });
  const renameFile = (path: string, name?: string) => {
    if (name) {
      const newPath = `${directory}/${name}${
        path.endsWith(SHORTCUT_EXTENSION) ? SHORTCUT_EXTENSION : ""
      }`;

      fs?.rename(path, newPath, () =>
        setFiles((currentFiles) =>
          currentFiles.map((file) =>
            file.replace(basename(path), basename(newPath))
          )
        )
      );
    }
  };

  useEffect(updateFiles, [directory, fs, updateFiles]);

  useEffect(
    () => () => {
      if (downloadLink) cleanUpBufferUrl(downloadLink);
    },
    [downloadLink]
  );

  return {
    fileActions: {
      deleteFile,
      downloadFile,
      renameFile,
    },
    files,
    updateFiles,
  };
};

export default useFiles;
