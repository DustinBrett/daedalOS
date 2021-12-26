import type { ApiError } from "browserfs/dist/node/core/api_error";
import type Stats from "browserfs/dist/node/core/node_fs_stats";
import {
  filterSystemFiles,
  getIconByFileExtension,
  getShortcutInfo,
} from "components/system/Files/FileEntry/functions";
import type { FileStat } from "components/system/Files/FileManager/functions";
import {
  findPathsRecursive,
  sortContents,
} from "components/system/Files/FileManager/functions";
import type { FocusEntryFunctions } from "components/system/Files/FileManager/useFocusableEntries";
import type {
  SetSortBy,
  SortByOrder,
} from "components/system/Files/FileManager/useSortBy";
import useSortBy from "components/system/Files/FileManager/useSortBy";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import type { AsyncZippable } from "fflate";
import { zip } from "fflate";
import ini from "ini";
import { basename, dirname, extname, join, relative } from "path";
import { useCallback, useEffect, useState } from "react";
import {
  EMPTY_BUFFER,
  FOLDER_ICON,
  INVALID_FILE_CHARACTERS,
  MOUNTABLE_EXTENSIONS,
  SHORTCUT_APPEND,
  SHORTCUT_EXTENSION,
} from "utils/constants";
import { bufferToUrl, cleanUpBufferUrl } from "utils/functions";
import { unrar, unzip } from "utils/zipFunctions";

export type FileActions = {
  archiveFiles: (paths: string[]) => void;
  deletePath: (path: string) => Promise<void>;
  downloadFiles: (paths: string[]) => void;
  extractFiles: (path: string) => void;
  newShortcut: (path: string, process: string) => void;
  renameFile: (path: string, name?: string) => void;
};

export type FolderActions = {
  addToFolder: () => void;
  newPath: (
    path: string,
    buffer?: Buffer,
    thenRename?: boolean
  ) => Promise<void>;
  pasteToFolder: () => void;
  resetFiles: () => void;
  sortByOrder: [SortByOrder, SetSortBy];
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

const useFolder = (
  directory: string,
  setRenaming: React.Dispatch<React.SetStateAction<string>>,
  { blurEntry, focusEntry }: FocusEntryFunctions,
  hideFolders = false
): Folder => {
  const [files, setFiles] = useState<Files>();
  const [downloadLink, setDownloadLink] = useState("");
  const [isLoading, setLoading] = useState(true);
  const {
    addFile,
    addFsWatcher,
    copyEntries,
    createPath,
    exists,
    fs,
    mkdir,
    mkdirRecursive,
    pasteList,
    readdir,
    readFile,
    removeFsWatcher,
    rename,
    rmdir,
    stat,
    unlink,
    updateFolder,
    writeFile,
  } = useFileSystem();
  const {
    sessionLoaded,
    setSortOrder,
    sortOrders: { [directory]: [sortOrder] = [] } = {},
  } = useSession();
  const [currentDirectory, setCurrentDirectory] = useState(directory);
  const { closeProcessesByUrl } = useProcesses();
  const statsWithShortcutInfo = useCallback(
    (fileName: string, stats: Stats): Promise<FileStat> =>
      new Promise((resolve) => {
        if (extname(fileName).toLowerCase() === SHORTCUT_EXTENSION) {
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
  const updateFiles = useCallback(
    async (newFile?: string, oldFile?: string, customSortOrder?: string[]) => {
      if (oldFile) {
        if (!(await exists(join(directory, oldFile)))) {
          const oldName = basename(oldFile);

          if (newFile) {
            setFiles((currentFiles = {}) =>
              Object.entries(currentFiles).reduce<Files>(
                (newFiles, [fileName, fileStats]) => ({
                  ...newFiles,
                  [fileName === oldName ? basename(newFile) : fileName]:
                    fileStats,
                }),
                {}
              )
            );
          } else {
            blurEntry(oldName);
            setFiles(
              ({ [oldName]: _fileStats, ...currentFiles } = {}) => currentFiles
            );
          }
        }
      } else if (newFile) {
        const baseName = basename(newFile);
        const allStats = await statsWithShortcutInfo(
          baseName,
          await stat(join(directory, newFile))
        );

        setFiles((currentFiles = {}) => ({
          ...currentFiles,
          [baseName]: allStats,
        }));
      } else {
        setLoading(true);

        try {
          const dirContents = (await readdir(directory)).filter(
            filterSystemFiles(directory)
          );
          const sortedFiles = await dirContents.reduce(
            async (processedFiles, file) => {
              const hideEntry =
                hideFolders &&
                (await stat(join(directory, file))).isDirectory();
              const newFiles = sortContents(
                {
                  ...(await processedFiles),
                  ...(!hideEntry && {
                    [file]: await statsWithShortcutInfo(
                      file,
                      await stat(join(directory, file))
                    ),
                  }),
                },
                customSortOrder || Object.keys(files || {})
              );

              setFiles(newFiles);

              return newFiles;
            },
            {}
          );

          if (dirContents.length > 0) {
            setSortOrder(directory, Object.keys(sortedFiles));
          } else {
            setFiles({});
          }
        } catch (error) {
          if ((error as ApiError).code === "ENOENT") {
            closeProcessesByUrl(directory);
          }
        }

        setLoading(false);
      }
    },
    [
      blurEntry,
      closeProcessesByUrl,
      directory,
      exists,
      files,
      hideFolders,
      readdir,
      setSortOrder,
      stat,
      statsWithShortcutInfo,
    ]
  );
  const deletePath = useCallback(
    async (path: string, updatePath = true): Promise<void> => {
      try {
        await unlink(path);
      } catch (error) {
        if ((error as ApiError).code === "EISDIR") {
          const dirContents = await readdir(path);

          await Promise.all(
            dirContents.map((entry) => deletePath(join(path, entry), false))
          );
          await rmdir(path);
        }
      }

      if (updatePath) updateFolder(directory, undefined, basename(path));
    },
    [directory, readdir, rmdir, unlink, updateFolder]
  );
  const createLink = (contents: Buffer, fileName?: string): void => {
    const link = document.createElement("a");

    link.href = bufferToUrl(contents);
    link.download = fileName || "download.zip";

    link.click();

    setDownloadLink(link.href);
  };
  const getFile = useCallback(
    (path: string): Promise<ZipFile> =>
      new Promise((resolve) => {
        fs?.readFile(path, (_readError, contents = EMPTY_BUFFER) =>
          resolve([relative(directory, path), contents])
        );
      }),
    [directory, fs]
  );
  const downloadFiles = useCallback(
    (paths: string[]): Promise<void> =>
      findPathsRecursive(paths, readdir, stat).then((allPaths) =>
        Promise.all(allPaths.map((path) => getFile(path))).then((filePaths) => {
          const zipFiles = filePaths.filter(Boolean);

          if (zipFiles.length === 1 && extname(zipFiles[0][0])) {
            const [[path, contents]] = zipFiles;

            createLink(contents, basename(path));
          } else {
            zip(
              Object.fromEntries(zipFiles) as AsyncZippable,
              (_zipError, newZipFile) => {
                if (newZipFile) {
                  createLink(Buffer.from(newZipFile));
                }
              }
            );
          }
        })
      ),
    [getFile, readdir, stat]
  );
  const renameFile = async (path: string, name?: string): Promise<void> => {
    const newName = name?.replace(INVALID_FILE_CHARACTERS, "").trim();

    if (newName) {
      const renamedPath = join(
        directory,
        `${newName}${
          path.endsWith(SHORTCUT_EXTENSION) ? SHORTCUT_EXTENSION : ""
        }`
      );

      if (!(await exists(renamedPath))) {
        await rename(path, renamedPath);
        updateFolder(directory, renamedPath, path);
      }
    }
  };
  const newPath = useCallback(
    async (
      name: string,
      buffer?: Buffer,
      thenRename = false
    ): Promise<void> => {
      const uniqueName = await createPath(name, directory, buffer);

      if (uniqueName && !uniqueName.includes("/")) {
        updateFolder(directory, uniqueName);

        if (thenRename) setRenaming(uniqueName);
        else {
          blurEntry();
          focusEntry(uniqueName);
        }
      }
    },
    [blurEntry, createPath, directory, focusEntry, setRenaming, updateFolder]
  );
  const newShortcut = useCallback(
    (path: string, process: string): void => {
      const pathExtension = extname(path).toLowerCase();

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
            IconFile:
              pathExtension &&
              (process !== "FileExplorer" ||
                MOUNTABLE_EXTENSIONS.has(pathExtension))
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
    },
    [fs, newPath]
  );
  const archiveFiles = useCallback(
    (paths: string[]): Promise<void> =>
      findPathsRecursive(paths, readdir, stat).then((allPaths) =>
        Promise.all(allPaths.map((path) => getFile(path))).then((filePaths) => {
          const zipFiles = filePaths.filter(Boolean);

          zip(
            Object.fromEntries(zipFiles) as AsyncZippable,
            (_zipError, newZipFile) => {
              if (newZipFile) {
                newPath(
                  `${basename(directory) || "archive"}.zip`,
                  Buffer.from(newZipFile)
                );
              }
            }
          );
        })
      ),
    [directory, getFile, newPath, readdir, stat]
  );

  const extractFiles = useCallback(
    async (path: string): Promise<void> => {
      const data = await readFile(path);
      const unzippedFiles =
        extname(path).toLowerCase() === ".rar"
          ? await unrar(data)
          : await unzip(data);
      const zipFolderName = basename(path, extname(path));

      if (await mkdir(join(directory, zipFolderName))) {
        for (const [extractPath, fileContents] of Object.entries(
          unzippedFiles
        )) {
          const localPath = join(directory, zipFolderName, extractPath);

          /* eslint-disable no-await-in-loop */
          if (fileContents.length === 0 && extractPath.endsWith("/")) {
            await mkdir(localPath);
          } else {
            if (!(await exists(dirname(localPath)))) {
              await mkdirRecursive(dirname(localPath));
            }

            await writeFile(localPath, Buffer.from(fileContents));
          }
          /* eslint-enable no-await-in-loop */
        }

        updateFolder(directory, zipFolderName);
      }
    },
    [
      directory,
      exists,
      mkdir,
      mkdirRecursive,
      readFile,
      updateFolder,
      writeFile,
    ]
  );
  const pasteToFolder = async (): Promise<void> => {
    const pasteEntries = Object.entries(pasteList);
    const moving = pasteEntries.some(([, operation]) => operation === "move");
    const copyFiles = async (entry: string, basePath = ""): Promise<void> => {
      const newBasePath = join(basePath, basename(entry));

      if ((await stat(entry)).isDirectory()) {
        const uniquePath = await createPath(newBasePath, directory);

        await Promise.all(
          (
            await readdir(entry)
          ).map((dirEntry) => copyFiles(join(entry, dirEntry), uniquePath))
        );
      } else {
        await createPath(newBasePath, directory, await readFile(entry));
      }
    };

    await Promise.all(
      pasteEntries.map(
        ([pasteEntry]): Promise<string | void> =>
          moving ? createPath(pasteEntry, directory) : copyFiles(pasteEntry)
      )
    );

    updateFolder(directory);

    if (moving) copyEntries([]);
  };

  useEffect(() => {
    if (directory !== currentDirectory) {
      setCurrentDirectory(directory);
      // eslint-disable-next-line unicorn/no-useless-undefined
      setFiles(undefined);
    }
  }, [currentDirectory, directory]);

  useEffect(() => {
    if (sessionLoaded) {
      if (!files) {
        updateFiles(undefined, undefined, sortOrder);
      } else {
        const fileNames = Object.keys(files);

        if (
          sortOrder &&
          fileNames.length === sortOrder.length &&
          directory === currentDirectory
        ) {
          if (fileNames.some((file) => !sortOrder.includes(file))) {
            const oldName = sortOrder.find(
              (entry) => !fileNames.includes(entry)
            );
            const newName = fileNames.find(
              (entry) => !sortOrder.includes(entry)
            );

            if (oldName && newName) {
              setSortOrder(
                directory,
                sortOrder.map((entry) => (entry === oldName ? newName : entry))
              );
            }
          } else if (
            fileNames.some((file, index) => file !== sortOrder[index])
          ) {
            setFiles((currentFiles) =>
              sortContents(currentFiles || files, sortOrder)
            );
          }
        }
      }
    }
  }, [
    currentDirectory,
    directory,
    files,
    sessionLoaded,
    setSortOrder,
    sortOrder,
    updateFiles,
  ]);

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
      deletePath,
      downloadFiles,
      extractFiles,
      newShortcut,
      renameFile,
    },
    files: files || {},
    folderActions: {
      addToFolder: () => addFile(directory, newPath),
      newPath,
      pasteToFolder,
      // eslint-disable-next-line unicorn/no-useless-undefined
      resetFiles: () => setFiles(undefined),
      sortByOrder: useSortBy(directory, files),
    },
    isLoading,
    updateFiles,
  };
};

export default useFolder;
