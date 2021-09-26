import type { BFSOneArgCallback } from "browserfs/dist/node/core/file_system";
import {
  filterSystemFiles,
  getIconByFileExtension,
} from "components/system/Files/FileEntry/functions";
import type { FileStats } from "components/system/Files/FileManager/functions";
import {
  iterateFileName,
  sortContents,
} from "components/system/Files/FileManager/functions";
import type { FocusEntryFunctions } from "components/system/Files/FileManager/useFocusableEntries";
import type { SetSortBy } from "components/system/Files/FileManager/useSortBy";
import useSortBy from "components/system/Files/FileManager/useSortBy";
import { useFileSystem } from "contexts/fileSystem";
import { useSession } from "contexts/session";
import type { AsyncZippable } from "fflate";
import { unzip, zip } from "fflate";
import type { Stats } from "fs";
import ini from "ini";
import { basename, dirname, extname, join } from "path";
import { useCallback, useEffect, useState } from "react";
import {
  EMPTY_BUFFER,
  SHORTCUT_APPEND,
  SHORTCUT_EXTENSION,
} from "utils/constants";
import { bufferToUrl, cleanUpBufferUrl } from "utils/functions";

export type FileActions = {
  archiveFiles: (paths: string[]) => void;
  deleteFile: (path: string) => void;
  downloadFiles: (paths: string[]) => void;
  extractFiles: (path: string) => void;
  newShortcut: (path: string, process: string) => void;
  renameFile: (path: string, name?: string) => void;
};

export type FolderActions = {
  addToFolder: () => void;
  newPath: (path: string, buffer?: Buffer, rename?: boolean) => void;
  pasteToFolder: () => void;
  setSortBy: SetSortBy;
};

type File = [string, Buffer];

export type Files = Record<string, Stats>;

type Folder = {
  fileActions: FileActions;
  folderActions: FolderActions;
  files: Files;
  isLoading: boolean;
  updateFiles: (newFile?: string, oldFile?: string) => void;
};

const useFolder = (
  directory: string,
  setRenaming: React.Dispatch<React.SetStateAction<string>>,
  { blurEntry, focusEntry }: FocusEntryFunctions
): Folder => {
  const [files, setFiles] = useState<Files>();
  const [downloadLink, setDownloadLink] = useState("");
  const [isLoading, setLoading] = useState(true);
  const {
    addFile,
    addFsWatcher,
    copyEntries,
    fs,
    pasteList,
    removeFsWatcher,
    updateFolder,
  } = useFileSystem();
  const {
    sessionLoaded,
    setSortOrders,
    sortOrders: { [directory]: sortOrder } = {},
  } = useSession();
  const getFiles = useCallback(
    (fileNames: string[]): Promise<Files> =>
      Promise.all(
        fileNames.map(
          (file): Promise<FileStats> =>
            new Promise((resolve, reject) =>
              fs?.stat(join(directory, file), (error, stats) =>
                error ? reject(error) : resolve([file, stats as Stats])
              )
            )
        )
      ).then(Object.fromEntries),
    [directory, fs]
  );
  const updateFiles = useCallback(
    (newFile?: string, oldFile?: string, initialOrder?: string[]) => {
      if (oldFile && newFile) {
        setFiles(
          ({ [basename(oldFile)]: fileStats, ...currentFiles } = {}) => ({
            ...currentFiles,
            [basename(newFile)]: fileStats,
          })
        );
      } else if (oldFile) {
        setFiles(
          ({ [basename(oldFile)]: _fileStats, ...currentFiles } = {}) =>
            currentFiles
        );
      } else if (newFile) {
        fs?.stat(join(directory, newFile), (error, stats) => {
          if (!error && stats) {
            setFiles((currentFiles = {}) => ({
              ...currentFiles,
              [basename(newFile)]: stats,
            }));
          }
        });
      } else {
        setLoading(true);
        fs?.readdir(directory, async (error, contents = []) => {
          setLoading(false);
          if (!error) {
            const filteredFiles = contents.filter(filterSystemFiles(directory));
            const updatedFiles = await getFiles(filteredFiles);

            setFiles((currentFiles = {}) =>
              sortContents(
                updatedFiles,
                initialOrder || Object.keys(currentFiles)
              )
            );
          } else {
            setFiles({});
          }
        });
      }
    },
    [directory, fs, getFiles]
  );
  const deleteFile = (path: string): void => {
    if (fs) {
      const fsDelete = files?.[basename(path)]?.isDirectory()
        ? fs.rmdir
        : fs.unlink;

      fsDelete(path, () => updateFolder(directory, "", path));
    }
  };
  const createLink = (contents: Buffer, fileName?: string): void => {
    const link = document.createElement("a");

    link.href = bufferToUrl(contents);
    link.download = fileName || "download.zip";

    link.click();

    setDownloadLink(link.href);
  };
  const getFile = (path: string): Promise<File | void> =>
    new Promise((resolve) => {
      if (extname(path) === SHORTCUT_EXTENSION) {
        resolve();
      } else if (files?.[basename(path)]?.isDirectory()) {
        resolve();
      } else {
        fs?.readFile(path, (_readError, contents = EMPTY_BUFFER) =>
          resolve([basename(path), contents])
        );
      }
    });
  const downloadFiles = (paths: string[]): Promise<void> =>
    Promise.all(paths.map((path) => getFile(path))).then((filePaths) => {
      const zipFiles = filePaths.filter(Boolean) as File[];

      if (zipFiles.length === 1) {
        const [[path, contents]] = zipFiles;

        createLink(contents, basename(path));
      } else {
        zip(
          Object.fromEntries(zipFiles) as AsyncZippable,
          (_zipError, newZipFile) => createLink(Buffer.from(newZipFile))
        );
      }
    });
  const renameFile = (path: string, name?: string): void => {
    const newName = name?.trim();

    if (newName) {
      const newPath = join(
        directory,
        `${newName}${
          path.endsWith(SHORTCUT_EXTENSION) ? SHORTCUT_EXTENSION : ""
        }`
      );

      fs?.exists(newPath, (exists) => {
        if (!exists) {
          fs.rename(path, newPath, () =>
            updateFolder(directory, newPath, path)
          );
        }
      });
    }
  };
  const newPath = (
    name: string,
    buffer?: Buffer,
    rename = false,
    iteration = 0
  ): void => {
    const isInternal = !buffer && dirname(name) !== ".";
    const baseName = isInternal ? basename(name) : name;
    const uniqueName = !iteration
      ? baseName
      : iterateFileName(baseName, iteration);
    const fullNewPath = join(directory, uniqueName);

    if (isInternal) {
      if (name !== fullNewPath) {
        fs?.exists(fullNewPath, (exists) => {
          if (exists) {
            newPath(name, buffer, rename, iteration + 1);
          } else {
            fs.rename(name, fullNewPath, () => {
              updateFolder(directory, uniqueName);
              updateFolder(dirname(name), "", name);
              blurEntry();
              focusEntry(uniqueName);
            });
          }
        });
      }
    } else {
      const checkWrite: BFSOneArgCallback = (error) => {
        if (!error) {
          updateFolder(directory, uniqueName);

          if (rename) {
            setRenaming(uniqueName);
          } else {
            focusEntry(uniqueName);
          }
        } else if (error.code === "EEXIST") {
          newPath(name, buffer, rename, iteration + 1);
        }
      };

      if (buffer) {
        fs?.writeFile(fullNewPath, buffer, { flag: "wx" }, checkWrite);
      } else {
        fs?.mkdir(fullNewPath, { flag: "wx" }, checkWrite);
      }
    }
  };
  const newShortcut = (path: string, process: string): void => {
    const baseName = basename(path);
    const shortcutPath = `${baseName}${SHORTCUT_APPEND}${SHORTCUT_EXTENSION}`;
    const pathExtension = extname(path);
    const shortcutData = ini.encode(
      {
        BaseURL: process,
        IconFile: pathExtension
          ? getIconByFileExtension(pathExtension)
          : "/System/Icons/folder.png",
        URL: path,
      },
      {
        section: "InternetShortcut",
        whitespace: false,
      }
    );

    newPath(shortcutPath, Buffer.from(shortcutData));
  };
  const archiveFiles = (paths: string[]): Promise<void> =>
    Promise.all(paths.map((path) => getFile(path))).then((filePaths) => {
      const zipFiles = filePaths.filter(Boolean) as File[];

      zip(
        Object.fromEntries(zipFiles) as AsyncZippable,
        (_zipError, newZipFile) => {
          newPath(
            `${basename(directory) || "archive"}.zip`,
            Buffer.from(newZipFile)
          );
        }
      );
    });
  const extractFiles = (path: string): void =>
    fs?.readFile(path, (readError, zipContents = EMPTY_BUFFER) => {
      if (!readError) {
        unzip(zipContents, (_unzipError, unzippedFiles) => {
          const zipFolderName = basename(path, extname(path));

          fs.mkdir(join(directory, zipFolderName), { flag: "w" }, () => {
            Object.entries(unzippedFiles).forEach(
              ([extractPath, fileContents]) => {
                if (extractPath.endsWith("/")) {
                  fs.mkdir(join(directory, zipFolderName, extractPath));
                } else {
                  fs.writeFile(
                    join(directory, zipFolderName, extractPath),
                    Buffer.from(fileContents)
                  );
                }
              }
            );
            updateFolder(directory, zipFolderName);
          });
        });
      }
    });
  const pasteToFolder = (): void =>
    Object.entries(pasteList).forEach(([fileEntry, operation]) => {
      if (operation === "move") {
        newPath(fileEntry);
        copyEntries([]);
      } else {
        fs?.readFile(fileEntry, (_readError, contents = EMPTY_BUFFER) =>
          newPath(basename(fileEntry), contents)
        );
      }
    });

  useEffect(() => {
    if (sessionLoaded) {
      if (!files) {
        updateFiles(undefined, undefined, sortOrder);
      } else {
        const fileNames = Object.keys(files);

        if (!sortOrder || fileNames.length !== sortOrder.length) {
          setSortOrders((currentSortOrder) => ({
            ...currentSortOrder,
            [directory]: fileNames,
          }));
        } else if (fileNames.some((file) => !sortOrder.includes(file))) {
          const oldName = sortOrder.find((entry) => !fileNames.includes(entry));
          const newName = fileNames.find((entry) => !sortOrder.includes(entry));

          if (oldName && newName) {
            setSortOrders((currentSortOrder) => ({
              ...currentSortOrder,
              [directory]: sortOrder.map((entry) =>
                entry === oldName ? newName : entry
              ),
            }));
          }
        } else if (fileNames.some((file, index) => file !== sortOrder[index])) {
          setFiles((currentFiles) =>
            sortContents(currentFiles || files, sortOrder)
          );
        }
      }
    }
  }, [directory, files, sessionLoaded, setSortOrders, sortOrder, updateFiles]);

  useEffect(
    () => () => {
      if (downloadLink) cleanUpBufferUrl(downloadLink);
    },
    [downloadLink]
  );

  useEffect(() => {
    addFsWatcher?.(directory, updateFiles);

    return () => removeFsWatcher?.(directory, updateFiles);
  }, [addFsWatcher, directory, removeFsWatcher, updateFiles]);

  return {
    fileActions: {
      archiveFiles,
      deleteFile,
      downloadFiles,
      extractFiles,
      newShortcut,
      renameFile,
    },
    folderActions: {
      addToFolder: () => addFile(newPath),
      newPath,
      pasteToFolder,
      setSortBy: useSortBy(directory, files),
    },
    files: files || {},
    isLoading,
    updateFiles,
  };
};

export default useFolder;
