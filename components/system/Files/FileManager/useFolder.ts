import type { BFSOneArgCallback } from "browserfs/dist/node/core/file_system";
import { filterSystemFiles } from "components/system/Files/FileEntry/functions";
import {
  iterateFileName,
  sortContents,
} from "components/system/Files/FileManager/functions";
import { useFileSystem } from "contexts/fileSystem";
import { useSession } from "contexts/session";
import { basename, dirname, join } from "path";
import { useCallback, useEffect, useState } from "react";
import { EMPTY_BUFFER, SHORTCUT_EXTENSION } from "utils/constants";
import { bufferToUrl, cleanUpBufferUrl } from "utils/functions";

export type FileActions = {
  deleteFile: (path: string) => void;
  downloadFile: (path: string) => void;
  renameFile: (path: string, name?: string) => void;
};

export type FolderActions = {
  newPath: (path: string, buffer?: Buffer) => void;
  addToFolder: () => void;
};

type Folder = {
  fileActions: FileActions;
  folderActions: FolderActions;
  files: string[];
  updateFiles: (appendFile?: string) => void;
};

const useFolder = (directory: string): Folder => {
  const [files, setFiles] = useState<string[]>([]);
  const [downloadLink, setDownloadLink] = useState<string>("");
  const { addFile, fs } = useFileSystem();
  const { focusEntry } = useSession();
  const updateFiles = useCallback(
    (appendFile = "") => {
      if (appendFile) {
        setFiles((currentFiles) => [...currentFiles, basename(appendFile)]);
      } else {
        fs?.readdir(directory, (_error, contents = []) =>
          setFiles(sortContents(contents).filter(filterSystemFiles(directory)))
        );
      }
    },
    [directory, fs]
  );
  const deleteFile = (path: string) => {
    const removeFile = () =>
      setFiles((currentFiles) =>
        currentFiles.filter((file) => file !== basename(path))
      );

    fs?.stat(path, (_error, stats) => {
      if (stats?.isDirectory()) {
        fs.rmdir(path, removeFile);
      } else {
        fs.unlink(path, removeFile);
      }
    });
  };
  const downloadFile = (path: string) =>
    fs?.readFile(path, (_error, contents = EMPTY_BUFFER) => {
      const link = document.createElement("a");

      link.href = bufferToUrl(contents);
      link.download = basename(path);

      link.click();

      setDownloadLink(link.href);
    });
  const renameFile = (path: string, name?: string) => {
    if (name) {
      const newPath = join(
        directory,
        `${name}${path.endsWith(SHORTCUT_EXTENSION) ? SHORTCUT_EXTENSION : ""}`
      );

      fs?.rename(path, newPath, () =>
        setFiles((currentFiles) =>
          currentFiles.map((file) =>
            file === basename(path) ? basename(newPath) : file
          )
        )
      );
    }
  };
  const newPath = (name: string, buffer?: Buffer, iteration = 0): void => {
    if (!buffer && ![".", directory].includes(dirname(name))) {
      fs?.rename(name, join(directory, basename(name)), () => updateFiles());
    } else {
      const uniqueName = !iteration ? name : iterateFileName(name, iteration);
      const resolvedPath = join(directory, uniqueName);
      const checkWrite: BFSOneArgCallback = (error) => {
        if (!error) {
          updateFiles(uniqueName);
          focusEntry(uniqueName);
        } else if (error.code === "EEXIST") {
          newPath(name, buffer, iteration + 1);
        }
      };

      if (buffer) {
        fs?.writeFile(resolvedPath, buffer, { flag: "wx" }, checkWrite);
      } else {
        fs?.mkdir(resolvedPath, { flag: "wx" }, checkWrite);
      }
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
    folderActions: {
      newPath,
      addToFolder: () => addFile(newPath),
    },
    files,
    updateFiles,
  };
};

export default useFolder;
