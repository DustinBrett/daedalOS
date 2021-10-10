import type {
  BFSCallback,
  BFSOneArgCallback,
} from "browserfs/dist/node/core/file_system";
import {
  filterSystemFiles,
  getIconByFileExtension,
  getShortcutInfo,
} from "components/system/Files/FileEntry/functions";
import type {
  FileStat,
  FileStats,
} from "components/system/Files/FileManager/functions";
import {
  findPathsRecursive,
  iterateFileName,
  sortContents,
} from "components/system/Files/FileManager/functions";
import type { FocusEntryFunctions } from "components/system/Files/FileManager/useFocusableEntries";
import type { SetSortBy } from "components/system/Files/FileManager/useSortBy";
import useSortBy from "components/system/Files/FileManager/useSortBy";
import { closeWithTransition } from "components/system/Window/functions";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import type { AsyncZippable } from "fflate";
import { unzip, zip } from "fflate";
import type { Stats } from "fs";
import ini from "ini";
import { basename, dirname, extname, isAbsolute, join, relative } from "path";
import { useCallback, useEffect, useState } from "react";
import {
  EMPTY_BUFFER,
  INVALID_FILE_CHARACTERS,
  PROCESS_DELIMITER,
  SHORTCUT_APPEND,
  SHORTCUT_EXTENSION,
} from "utils/constants";
import { bufferToUrl, cleanUpBufferUrl } from "utils/functions";

export type FileActions = {
  archiveFiles: (paths: string[]) => void;
  deleteFile: (path: string) => Promise<void>;
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

type ZipFile = [string, Buffer];

export type Files = Record<string, FileStat>;

type Folder = {
  fileActions: FileActions;
  folderActions: FolderActions;
  files: Files;
  isLoading: boolean;
  updateFiles: (newFile?: string, oldFile?: string) => void;
};

export const FOLDER_ICON = "/System/Icons/folder.png";
export const UNKNOWN_ICON = "/System/Icons/unknown.png";

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
  const { close } = useProcesses();
  const statsWithShortcutInfo = useCallback(
    (fileName: string, stats: Stats): Promise<FileStat> =>
      new Promise((resolve) => {
        if (extname(fileName) === SHORTCUT_EXTENSION) {
          fs?.readFile(
            join(directory, fileName),
            (_readError, contents = EMPTY_BUFFER) =>
              resolve(
                Object.assign(stats, {
                  systemShortcut: getShortcutInfo(contents).type === "System",
                })
              )
          );
        } else {
          resolve(stats);
        }
      }),
    [directory, fs]
  );
  const getFiles = useCallback(
    (fileNames: string[]): Promise<Files> =>
      Promise.all(
        fileNames.map(
          (file): Promise<FileStats> =>
            new Promise((resolve, reject) =>
              fs?.stat(join(directory, file), async (error, stats) =>
                error
                  ? reject(error)
                  : resolve([
                      file,
                      await statsWithShortcutInfo(file, stats as Stats),
                    ])
              )
            )
        )
      ).then(Object.fromEntries),
    [directory, fs, statsWithShortcutInfo]
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
        fs?.stat(join(directory, newFile), async (error, stats) => {
          if (!error && stats) {
            const baseName = basename(newFile);
            const allStats = await statsWithShortcutInfo(
              baseName,
              stats as Stats
            );

            setFiles((currentFiles = {}) => ({
              ...currentFiles,
              [baseName]: allStats,
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
            if (error.code === "ENOENT") {
              closeWithTransition(
                close,
                `FileExplorer${PROCESS_DELIMITER}${directory}`
              );
            }

            setFiles({});
          }
        });
      }
    },
    [close, directory, fs, getFiles, statsWithShortcutInfo]
  );
  const deleteFile = (path: string, updatePath = true): Promise<void> => {
    const updateDirectory = (): void => {
      if (updatePath) updateFolder(directory, undefined, basename(path));
    };

    return new Promise((resolve) =>
      fs?.unlink(path, (unlinkError) => {
        if (unlinkError?.code === "EISDIR") {
          fs?.readdir(path, (_error, contents = []) =>
            Promise.all(
              contents.map((entry) => deleteFile(join(path, entry), false))
            )
              .then(() => fs.rmdir(path, updateDirectory))
              .finally(resolve)
          );
        } else {
          updateDirectory();
          resolve();
        }
      })
    );
  };
  const createLink = (contents: Buffer, fileName?: string): void => {
    const link = document.createElement("a");

    link.href = bufferToUrl(contents);
    link.download = fileName || "download.zip";

    link.click();

    setDownloadLink(link.href);
  };
  const getFile = (path: string): Promise<ZipFile> =>
    new Promise((resolve) =>
      fs?.readFile(path, (_readError, contents = EMPTY_BUFFER) =>
        resolve([relative(directory, path), contents])
      )
    );
  const downloadFiles = (paths: string[]): Promise<void> =>
    findPathsRecursive(fs, paths).then((allPaths) =>
      Promise.all(allPaths.map((path) => getFile(path))).then((filePaths) => {
        const zipFiles = filePaths.filter(Boolean) as ZipFile[];

        if (zipFiles.length === 1) {
          const [[path, contents]] = zipFiles;

          createLink(contents, basename(path));
        } else {
          zip(
            Object.fromEntries(zipFiles) as AsyncZippable,
            (_zipError, newZipFile) => createLink(Buffer.from(newZipFile))
          );
        }
      })
    );

  const renameFile = (path: string, name?: string): void => {
    const newName = name?.replace(INVALID_FILE_CHARACTERS, "").trim();

    if (newName) {
      const renamedPath = join(
        directory,
        `${newName}${
          path.endsWith(SHORTCUT_EXTENSION) ? SHORTCUT_EXTENSION : ""
        }`
      );

      fs?.exists(renamedPath, (exists) => {
        if (!exists) {
          fs.rename(path, renamedPath, () =>
            updateFolder(directory, renamedPath, path)
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
  ): Promise<string> =>
    new Promise((resolve, reject) => {
      const isInternal = !buffer && isAbsolute(name);
      const baseName = isInternal ? basename(name) : name;
      const uniqueName = !iteration
        ? baseName
        : iterateFileName(baseName, iteration);
      const fullNewPath = join(directory, uniqueName);

      if (isInternal) {
        if (name !== fullNewPath) {
          fs?.exists(fullNewPath, (exists) => {
            if (exists) {
              newPath(name, buffer, rename, iteration + 1).then(resolve);
            } else {
              fs.rename(name, fullNewPath, () => {
                updateFolder(directory, uniqueName);
                updateFolder(dirname(name), "", name);
                blurEntry();
                focusEntry(uniqueName);
                resolve(uniqueName);
              });
            }
          });
        }
      } else {
        const checkWrite: BFSOneArgCallback = (error) => {
          if (!error) {
            if (!uniqueName.includes("/")) {
              updateFolder(directory, uniqueName);

              if (rename) {
                setRenaming(uniqueName);
              } else {
                focusEntry(uniqueName);
              }
            }

            resolve(uniqueName);
          } else if (error.code === "EEXIST") {
            newPath(name, buffer, rename, iteration + 1).then(resolve);
          } else {
            reject();
          }
        };

        if (buffer) {
          fs?.writeFile(fullNewPath, buffer, { flag: "wx" }, checkWrite);
        } else {
          fs?.mkdir(fullNewPath, { flag: "wx" }, checkWrite);
        }
      }
    });

  const newShortcut = (path: string, process: string): void => {
    const pathExtension = extname(path);

    if (pathExtension === SHORTCUT_EXTENSION) {
      fs?.readFile(path, (_readError, contents = EMPTY_BUFFER) =>
        newPath(basename(path), contents)
      );
    } else {
      const baseName = basename(path);
      const shortcutPath = `${baseName}${SHORTCUT_APPEND}${SHORTCUT_EXTENSION}`;
      const shortcutData = ini.encode(
        {
          BaseURL: process,
          IconFile: pathExtension
            ? getIconByFileExtension(pathExtension)
            : FOLDER_ICON,
          URL: path,
        },
        {
          section: "InternetShortcut",
          whitespace: false,
        }
      );

      newPath(shortcutPath, Buffer.from(shortcutData));
    }
  };
  const archiveFiles = (paths: string[]): Promise<void> =>
    findPathsRecursive(fs, paths).then((allPaths) =>
      Promise.all(allPaths.map((path) => getFile(path))).then((filePaths) => {
        const zipFiles = filePaths.filter(Boolean) as ZipFile[];

        zip(
          Object.fromEntries(zipFiles) as AsyncZippable,
          (_zipError, newZipFile) => {
            newPath(
              `${basename(directory) || "archive"}.zip`,
              Buffer.from(newZipFile)
            );
          }
        );
      })
    );
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
    Object.entries(pasteList).forEach(([pasteEntry, operation]) => {
      if (operation === "move") {
        newPath(pasteEntry);
        copyEntries([]);
      } else {
        const copyFiles =
          (entry: string, basePath = ""): BFSCallback<Buffer> =>
          (readError, fileContents) =>
            newPath(join(basePath, basename(entry)), fileContents).then(
              (uniquePath) => {
                if (readError?.code === "EISDIR") {
                  fs?.readdir(entry, (_dirError, dirContents) =>
                    dirContents?.forEach((dirEntry) => {
                      const dirPath = join(entry, dirEntry);

                      fs.readFile(dirPath, copyFiles(dirPath, uniquePath));
                    })
                  );
                }
              }
            );

        fs?.readFile(pasteEntry, copyFiles(pasteEntry));
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
    files: files || {},
    folderActions: {
      addToFolder: () => addFile(newPath),
      newPath,
      pasteToFolder,
      setSortBy: useSortBy(directory, files),
    },
    isLoading,
    updateFiles,
  };
};

export default useFolder;
