import type { ApiError } from "browserfs/dist/node/core/api_error";
import type Stats from "browserfs/dist/node/core/node_fs_stats";
import {
  createShortcut,
  filterSystemFiles,
  getIconByFileExtension,
  getShortcutInfo,
  makeExternalShortcut,
} from "components/system/Files/FileEntry/functions";
import type { FileStat } from "components/system/Files/FileManager/functions";
import {
  findPathsRecursive,
  sortByDate,
  sortBySize,
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
import type { AsyncZipOptions, AsyncZippable } from "fflate";
import { basename, dirname, extname, join, relative } from "path";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BASE_ZIP_CONFIG,
  DESKTOP_PATH,
  FOLDER_ICON,
  INVALID_FILE_CHARACTERS,
  MOUNTABLE_EXTENSIONS,
  SHORTCUT_APPEND,
  SHORTCUT_EXTENSION,
} from "utils/constants";
import { bufferToUrl, cleanUpBufferUrl, preloadLibs } from "utils/functions";

export type FileActions = {
  archiveFiles: (paths: string[]) => void;
  deleteLocalPath: (path: string) => Promise<void>;
  downloadFiles: (paths: string[]) => void;
  extractFiles: (path: string) => void;
  newShortcut: (path: string, process: string) => void;
  renameFile: (path: string, name?: string) => void;
};

export type CompleteAction = "rename" | "updateUrl";

export type FolderActions = {
  addToFolder: () => void;
  newPath: (
    path: string,
    buffer?: Buffer,
    completeAction?: CompleteAction
  ) => Promise<void>;
  pasteToFolder: () => void;
  resetFiles: () => void;
  sortByOrder: [SortByOrder, SetSortBy];
};

type ZipFile = [string, Buffer];

export type Files = Record<string, FileStat>;

type Folder = {
  fileActions: FileActions;
  files: Files;
  folderActions: FolderActions;
  isLoading: boolean;
  updateFiles: (newFile?: string, oldFile?: string) => void;
};

type FolderFlags = {
  hideFolders?: boolean;
  hideLoading?: boolean;
  preloadShortcuts?: boolean;
  skipFsWatcher?: boolean;
  skipSorting?: boolean;
};

const NO_FILES = undefined;

const useFolder = (
  directory: string,
  setRenaming: React.Dispatch<React.SetStateAction<string>>,
  { blurEntry, focusEntry }: FocusEntryFunctions,
  {
    hideFolders,
    hideLoading,
    preloadShortcuts,
    skipFsWatcher,
    skipSorting,
  }: FolderFlags
): Folder => {
  const [files, setFiles] = useState<Files | typeof NO_FILES>();
  const [downloadLink, setDownloadLink] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const {
    addFile,
    addFsWatcher,
    copyEntries,
    createPath,
    deletePath,
    exists,
    fs,
    lstat,
    mkdir,
    mkdirRecursive,
    pasteList,
    readdir,
    readFile,
    removeFsWatcher,
    rename,
    stat,
    updateFolder,
    writeFile,
  } = useFileSystem();
  const {
    sessionLoaded,
    setIconPositions,
    setSortOrder,
    sortOrders: { [directory]: [sortOrder, sortBy, sortAscending] = [] } = {},
  } = useSession();
  const [currentDirectory, setCurrentDirectory] = useState(directory);
  const { closeProcessesByUrl } = useProcesses();
  const statsWithShortcutInfo = useCallback(
    async (fileName: string, stats: Stats): Promise<FileStat> => {
      if (extname(fileName).toLowerCase() === SHORTCUT_EXTENSION) {
        const contents = await readFile(join(directory, fileName));

        return Object.assign(stats, {
          systemShortcut: getShortcutInfo(contents).type === "System",
        });
      }

      return stats;
    },
    [directory, readFile]
  );
  const isSimpleSort =
    skipSorting || !sortBy || sortBy === "name" || sortBy === "type";
  const updateFiles = useCallback(
    async (newFile?: string, oldFile?: string) => {
      if (oldFile) {
        if (!(await exists(join(directory, oldFile)))) {
          const oldName = basename(oldFile);

          if (newFile) {
            setFiles((currentFiles = {}) =>
              Object.entries(currentFiles).reduce<Files>(
                (newFiles, [fileName, fileStats]) => {
                  // eslint-disable-next-line no-param-reassign
                  newFiles[
                    fileName === oldName ? basename(newFile) : fileName
                  ] = fileStats;

                  return newFiles;
                },
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
        const filePath = join(directory, newFile);
        const fileStats = await statsWithShortcutInfo(
          baseName,
          isSimpleSort ? await lstat(filePath) : await stat(filePath)
        );

        setFiles((currentFiles = {}) => ({
          ...currentFiles,
          [baseName]: fileStats,
        }));
      } else {
        setIsLoading(true);

        try {
          const dirContents = (await readdir(directory)).filter(
            filterSystemFiles(directory)
          );

          if (preloadShortcuts) {
            preloadLibs(
              dirContents
                .filter((entry) => entry.endsWith(SHORTCUT_EXTENSION))
                .map((entry) => `${directory}/${entry}`)
            );
          }

          const sortedFiles = await dirContents.reduce(
            async (processedFiles, file) => {
              try {
                const filePath = join(directory, file);
                const fileStats = isSimpleSort
                  ? await lstat(filePath)
                  : await stat(filePath);
                const hideEntry = hideFolders && fileStats.isDirectory();
                let newFiles = await processedFiles;

                if (!hideEntry) {
                  newFiles[file] = await statsWithShortcutInfo(file, fileStats);
                  newFiles = sortContents(
                    newFiles,
                    (!skipSorting && sortOrder) || [],
                    isSimpleSort
                      ? undefined
                      : sortBy === "date"
                      ? sortByDate(directory)
                      : sortBySize,
                    sortAscending
                  );
                }

                if (hideLoading) setFiles(newFiles);

                return newFiles;
              } catch {
                return processedFiles;
              }
            },
            Promise.resolve({} as Files)
          );

          if (dirContents.length > 0) {
            if (!hideLoading) setFiles(sortedFiles);

            const newSortOrder = Object.keys(sortedFiles);

            if (
              !skipSorting &&
              (!sortOrder ||
                sortOrder?.some(
                  (entry, index) => newSortOrder[index] !== entry
                ))
            ) {
              window.requestAnimationFrame(() =>
                setSortOrder(directory, newSortOrder)
              );
            }
          } else {
            setFiles(Object.create(null) as Files);
          }
        } catch (error) {
          if ((error as ApiError).code === "ENOENT") {
            closeProcessesByUrl(directory);
          }
        }

        setIsLoading(false);
      }
    },
    [
      blurEntry,
      closeProcessesByUrl,
      directory,
      exists,
      hideFolders,
      hideLoading,
      isSimpleSort,
      lstat,
      preloadShortcuts,
      readdir,
      setSortOrder,
      skipSorting,
      sortAscending,
      sortBy,
      sortOrder,
      stat,
      statsWithShortcutInfo,
    ]
  );
  const deleteLocalPath = useCallback(
    async (path: string): Promise<void> => {
      await deletePath(path);
      updateFolder(directory, undefined, basename(path));
    },
    [deletePath, directory, updateFolder]
  );
  const createLink = (contents: Buffer, fileName?: string): void => {
    const link = document.createElement("a");

    link.href = bufferToUrl(contents);
    link.download = fileName || "download.zip";

    link.click();

    setDownloadLink(link.href);
  };
  const getFile = useCallback(
    async (path: string): Promise<ZipFile> => [
      relative(directory, path),
      await readFile(path),
    ],
    [directory, readFile]
  );
  const renameFile = async (path: string, name?: string): Promise<void> => {
    let newName = name?.replace(INVALID_FILE_CHARACTERS, "").trim();

    if (newName?.endsWith(".")) {
      newName = newName.slice(0, -1);
    }

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

      if (dirname(path) === DESKTOP_PATH) {
        setIconPositions((currentPositions) => {
          const { [path]: iconPosition, ...newPositions } = currentPositions;

          if (iconPosition) {
            newPositions[renamedPath] = iconPosition;
          }

          return newPositions;
        });
      }
    }
  };
  const newPath = useCallback(
    async (
      name: string,
      buffer?: Buffer,
      completeAction?: CompleteAction
    ): Promise<void> => {
      const uniqueName = await createPath(name, directory, buffer);

      if (uniqueName && !uniqueName.includes("/")) {
        updateFolder(directory, uniqueName);

        if (completeAction === "rename") setRenaming(uniqueName);
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
        fs?.readFile(path, (_readError, contents = Buffer.from("")) =>
          newPath(basename(path), contents)
        );
        return;
      }

      const baseName = basename(path);
      const shortcutPath = `${baseName}${SHORTCUT_APPEND}${SHORTCUT_EXTENSION}`;
      const shortcutData = createShortcut({
        BaseURL: process,
        IconFile:
          pathExtension &&
          (process !== "FileExplorer" ||
            MOUNTABLE_EXTENSIONS.has(pathExtension))
            ? getIconByFileExtension(pathExtension)
            : FOLDER_ICON,
        URL: path,
      });

      newPath(shortcutPath, Buffer.from(shortcutData));
    },
    [fs, newPath]
  );
  const createZipFile = useCallback(
    async (paths: string[]): Promise<AsyncZippable> => {
      const allPaths = await findPathsRecursive(paths, readdir, stat);
      const filePaths = await Promise.all(
        allPaths.map((path) => getFile(path))
      );
      const { addEntryToZippable, createZippable } = await import(
        "utils/zipFunctions"
      );

      return filePaths
        .filter(Boolean)
        .map(
          ([path, file]) =>
            [
              path,
              extname(path) === SHORTCUT_EXTENSION
                ? makeExternalShortcut(file)
                : file,
            ] as [string, Buffer]
        )
        .reduce<AsyncZippable>(
          (accFiles, [path, file]) =>
            addEntryToZippable(accFiles, createZippable(path, file)),
          {}
        );
    },
    [getFile, readdir, stat]
  );
  const archiveFiles = useCallback(
    async (paths: string[]): Promise<void> => {
      const { zip } = await import("fflate");

      zip(
        await createZipFile(paths),
        BASE_ZIP_CONFIG,
        (_zipError, newZipFile) => {
          if (newZipFile) {
            newPath(
              `${basename(directory) || "archive"}.zip`,
              Buffer.from(newZipFile)
            );
          }
        }
      );
    },
    [createZipFile, directory, newPath]
  );
  const downloadFiles = useCallback(
    async (paths: string[]): Promise<void> => {
      const zipFiles = await createZipFile(paths);
      const zipEntries = Object.entries(zipFiles);

      if (zipEntries.length === 1 && extname(zipEntries[0][0])) {
        const [[path, file]] = zipEntries;
        const [contents] = file as [Uint8Array, AsyncZipOptions];

        createLink(contents as Buffer, basename(path));
      } else {
        const { zip } = await import("fflate");

        zip(zipFiles, BASE_ZIP_CONFIG, (_zipError, newZipFile) => {
          if (newZipFile) {
            createLink(Buffer.from(newZipFile));
          }
        });
      }
    },
    [createZipFile]
  );
  const extractFiles = useCallback(
    async (path: string): Promise<void> => {
      const data = await readFile(path);
      const { unarchive, unzip } = await import("utils/zipFunctions");
      const unzippedFiles = [".jsdos", ".wsz", ".zip"].includes(
        extname(path).toLowerCase()
      )
        ? await unzip(data)
        : await unarchive(path, data);
      const zipFolderName = basename(
        path,
        path.toLowerCase().endsWith(".tar.gz") ? ".tar.gz" : extname(path)
      );
      const uniqueName = await createPath(zipFolderName, directory);

      try {
        await Promise.all(
          Object.entries(unzippedFiles).map(
            async ([extractPath, fileContents]) => {
              const localPath = join(directory, uniqueName, extractPath);

              if (fileContents.length === 0 && extractPath.endsWith("/")) {
                await mkdir(localPath);
              } else {
                if (!(await exists(dirname(localPath)))) {
                  await mkdirRecursive(dirname(localPath));
                }

                await writeFile(localPath, Buffer.from(fileContents));
              }
            }
          )
        );
      } catch {
        // Ignore failure to extract
      }

      updateFolder(directory, uniqueName);
    },
    [
      createPath,
      directory,
      exists,
      mkdir,
      mkdirRecursive,
      readFile,
      updateFolder,
      writeFile,
    ]
  );
  const pasteToFolder = useCallback(async (): Promise<void> => {
    const pasteEntries = Object.entries(pasteList);
    const moving = pasteEntries.some(([, operation]) => operation === "move");
    const copyFiles = async (entry: string, basePath = ""): Promise<void> => {
      const newBasePath = join(basePath, basename(entry));
      let uniquePath: string;

      if ((await lstat(entry)).isDirectory()) {
        uniquePath = await createPath(newBasePath, directory);

        await Promise.all(
          (
            await readdir(entry)
          ).map((dirEntry) => copyFiles(join(entry, dirEntry), uniquePath))
        );
      } else {
        uniquePath = await createPath(
          newBasePath,
          directory,
          await readFile(entry)
        );
      }

      if (!basePath) updateFolder(directory, uniquePath);
    };

    const movedPaths = await Promise.all(
      pasteEntries.map(
        ([pasteEntry]): Promise<string | void> =>
          moving ? createPath(pasteEntry, directory) : copyFiles(pasteEntry)
      )
    );

    if (moving) {
      movedPaths
        .filter(Boolean)
        .forEach((movedPath) => updateFolder(directory, movedPath as string));

      copyEntries([]);
    }
  }, [
    copyEntries,
    createPath,
    directory,
    lstat,
    pasteList,
    readFile,
    readdir,
    updateFolder,
  ]);
  const sortByOrder = useSortBy(directory, files);
  const folderActions = useMemo(
    () => ({
      addToFolder: () => addFile(directory, newPath),
      newPath,
      pasteToFolder,
      resetFiles: () => setFiles(NO_FILES),
      sortByOrder,
    }),
    [addFile, directory, newPath, pasteToFolder, sortByOrder]
  );
  const updatingFiles = useRef(false);

  useEffect(() => {
    if (directory !== currentDirectory) {
      setCurrentDirectory(directory);
      setFiles(NO_FILES);
    }
  }, [currentDirectory, directory]);

  useEffect(() => {
    if (sessionLoaded) {
      if (files) {
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
      } else if (!updatingFiles.current) {
        updatingFiles.current = true;
        updateFiles().then(() => {
          updatingFiles.current = false;
        });
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
    if (!skipFsWatcher) addFsWatcher?.(directory, updateFiles);

    return () => {
      if (!skipFsWatcher) removeFsWatcher?.(directory, updateFiles);
    };
  }, [addFsWatcher, directory, removeFsWatcher, skipFsWatcher, updateFiles]);

  return {
    fileActions: {
      archiveFiles,
      deleteLocalPath,
      downloadFiles,
      extractFiles,
      newShortcut,
      renameFile,
    },
    files: files || {},
    folderActions,
    isLoading,
    updateFiles,
  };
};

export default useFolder;
