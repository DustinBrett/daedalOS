import { basename, dirname, extname, join, relative } from "path";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type AsyncZipOptions, type AsyncZippable } from "fflate";
import { type ApiError } from "browserfs/dist/node/core/api_error";
import type Stats from "browserfs/dist/node/core/node_fs_stats";
import useTransferDialog, {
  type ObjectReader,
} from "components/system/Dialogs/Transfer/useTransferDialog";
import {
  createShortcut,
  filterSystemFiles,
  getCachedShortcut,
  getShortcutInfo,
  isExistingFile,
  makeExternalShortcut,
} from "components/system/Files/FileEntry/functions";
import {
  type FileStat,
  findPathsRecursive,
  removeInvalidFilenameCharacters,
  sortByDate,
  sortBySize,
  sortContents,
  getParentDirectories,
} from "components/system/Files/FileManager/functions";
import { type FocusEntryFunctions } from "components/system/Files/FileManager/useFocusableEntries";
import useSortBy, {
  type SetSortBy,
  type SortByOrder,
} from "components/system/Files/FileManager/useSortBy";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import {
  BASE_ZIP_CONFIG,
  DESKTOP_PATH,
  MILLISECONDS_IN_SECOND,
  PROCESS_DELIMITER,
  SHORTCUT_APPEND,
  SHORTCUT_EXTENSION,
  SYSTEM_SHORTCUT_DIRECTORIES,
  ZIP_EXTENSIONS,
} from "utils/constants";
import {
  bufferToUrl,
  cleanUpBufferUrl,
  getExtension,
  getIteratedNames,
  saveUnpositionedDesktopIcons,
  updateIconPositions,
} from "utils/functions";
import { type CaptureTriggerEvent } from "contexts/menu/useMenuContextState";

export type FileActions = {
  archiveFiles: (paths: string[]) => Promise<void>;
  deleteLocalPath: (path: string) => Promise<void>;
  downloadFiles: (paths: string[]) => Promise<void>;
  extractFiles: (path: string) => Promise<void>;
  newShortcut: (path: string, process: string) => void;
  renameFile: (path: string, name?: string) => Promise<void>;
};

export type CompleteAction = "rename" | "updateUrl";

export const COMPLETE_ACTION: Record<string, CompleteAction> = {
  RENAME: "rename",
  UPDATE_URL: "updateUrl",
};

export type NewPath = (
  fileName: string,
  buffer?: Buffer,
  completeAction?: CompleteAction,
  earlyNameCallback?: (newName: string) => void
) => Promise<string>;

export type FolderActions = {
  addToFolder: () => Promise<string[]>;
  newPath: NewPath;
  pasteToFolder: (event?: CaptureTriggerEvent) => void;
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
  isDesktop?: boolean;
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
    isDesktop,
    skipFsWatcher,
    skipSorting,
  }: FolderFlags
): Folder => {
  const [files, setFiles] = useState<Files | typeof NO_FILES>();
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
    setPasteList,
    stat,
    updateFolder,
    writeFile,
  } = useFileSystem();
  const {
    iconPositions,
    sessionLoaded,
    setIconPositions,
    setSortOrder,
    sortOrders,
  } = useSession();
  const { [directory]: [sortOrder, sortBy, sortAscending] = [] } =
    sortOrders || {};
  const [currentDirectory, setCurrentDirectory] = useState(directory);
  const { close, closeProcessesByUrl } = useProcesses();
  const statsWithShortcutInfo = useCallback(
    async (fileName: string, stats: Stats): Promise<FileStat> => {
      if (
        SYSTEM_SHORTCUT_DIRECTORIES.has(directory) &&
        getExtension(fileName) === SHORTCUT_EXTENSION
      ) {
        const shortcutPath = join(directory, fileName);
        const { type } = isExistingFile(stats)
          ? getCachedShortcut(shortcutPath)
          : getShortcutInfo(await readFile(shortcutPath));

        return Object.assign(stats, { systemShortcut: type === "System" });
      }

      return stats;
    },
    [directory, readFile]
  );
  const isSimpleSort = useMemo(
    () => skipSorting || !sortBy || sortBy === "name" || sortBy === "type",
    [skipSorting, sortBy]
  );
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
      if (await deletePath(path)) {
        updateFolder(directory, undefined, basename(path));
      }
    },
    [deletePath, directory, updateFolder]
  );
  const triggerDownload = useCallback(
    async (contents: Buffer, fileName?: string): Promise<void> => {
      const extension = fileName ? getExtension(fileName) : undefined;
      const name = fileName
        ? extension
          ? fileName
          : `${fileName}.zip`
        : "download.zip";

      if (window.showSaveFilePicker && extension !== SHORTCUT_EXTENSION) {
        try {
          const filePickerHandle = await window.showSaveFilePicker({
            id: "SaveFilePicker",
            startIn: "desktop",
            suggestedName: name,
          });
          const fileWriter = await filePickerHandle.createWritable();

          await fileWriter.write(contents as BufferSource);
          await fileWriter.close();
        } catch {
          // Ignore failure with file picker
        }
      } else {
        const link = document.createElement("a");
        const href = bufferToUrl(contents);

        link.href = href;
        link.download = name;

        link.click();
        link.remove();

        setTimeout(() => {
          cleanUpBufferUrl(href);
          link.remove();
        }, MILLISECONDS_IN_SECOND);
      }
    },
    []
  );
  const getFile = useCallback(
    async (path: string): Promise<ZipFile> => [
      relative(directory, path),
      await readFile(path),
    ],
    [directory, readFile]
  );
  const renameFile = useCallback(
    async (path: string, name?: string): Promise<void> => {
      let newName = removeInvalidFilenameCharacters(name).trim();

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

        if (!(await exists(renamedPath)) && (await rename(path, renamedPath))) {
          if (isDesktop) {
            saveUnpositionedDesktopIcons(setIconPositions);

            setIconPositions((currentPositions) => ({
              ...currentPositions,
              ...(currentPositions[path]
                ? { [renamedPath]: currentPositions[path] }
                : undefined),
            }));

            await updateFolder(directory, renamedPath, path);

            requestAnimationFrame(() =>
              setIconPositions((currentPositions) => {
                const { [path]: iconPosition, ...newPositions } =
                  currentPositions;

                if (iconPosition) {
                  newPositions[renamedPath] = iconPosition;
                }

                return newPositions;
              })
            );
          } else {
            await updateFolder(directory, renamedPath, path);
          }
        }
      }
    },
    [directory, exists, isDesktop, rename, setIconPositions, updateFolder]
  );
  const newPath = useCallback(
    async (
      name: string,
      buffer?: Buffer,
      completeAction?: CompleteAction,
      earlyNameCallback?: (newName: string) => void
    ): Promise<string> => {
      const uniqueName = await createPath(name, directory, buffer);

      if (uniqueName && !uniqueName.includes("/")) {
        earlyNameCallback?.(uniqueName);
        await updateFolder(directory, uniqueName);

        if (completeAction === "rename") setRenaming(uniqueName);
        else {
          blurEntry();
          focusEntry(uniqueName);
        }
      }

      return uniqueName;
    },
    [blurEntry, createPath, directory, focusEntry, setRenaming, updateFolder]
  );
  const newShortcut = useCallback(
    (path: string, process: string): void => {
      const pathExtension = getExtension(path);

      if (pathExtension === SHORTCUT_EXTENSION) {
        fs?.readFile(path, (_readError, contents = Buffer.from("")) =>
          newPath(basename(path), contents)
        );
        return;
      }

      const baseName = basename(path);
      const shortcutPath = `${baseName}${SHORTCUT_APPEND}${SHORTCUT_EXTENSION}`;
      const shortcutData = createShortcut({ BaseURL: process, URL: path });

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
              getExtension(path) === SHORTCUT_EXTENSION
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
      const [[path, file]] = zipEntries.length === 0 ? [["", ""]] : zipEntries;
      const singleParentEntry = zipEntries.length === 1;

      if (singleParentEntry && extname(path)) {
        const [contents] = file as [Uint8Array, AsyncZipOptions];

        triggerDownload(contents as Buffer, basename(path));
      } else {
        const { zip } = await import("fflate");

        zip(
          singleParentEntry ? (file as AsyncZippable) : zipFiles,
          BASE_ZIP_CONFIG,
          (_zipError, newZipFile) => {
            if (newZipFile) {
              triggerDownload(
                Buffer.from(newZipFile),
                singleParentEntry ? path : undefined
              );
            }
          }
        );
      }
    },
    [triggerDownload, createZipFile]
  );
  const { openTransferDialog } = useTransferDialog();
  const extractFiles = useCallback(
    async (path: string): Promise<void> => {
      openTransferDialog(undefined, path, "Extracting");

      const closeDialog = (): void =>
        close(`Transfer${PROCESS_DELIMITER}${path}`);

      try {
        const { unarchive, unzip } = await import("utils/zipFunctions");
        const data = await readFile(path);
        const unzippedFiles = Object.entries(
          ZIP_EXTENSIONS.has(getExtension(path))
            ? await unzip(data)
            : await unarchive(path, data)
        );

        if (unzippedFiles.length === 0) closeDialog();
        else {
          const zipFolderName = basename(
            path,
            path.toLowerCase().endsWith(".tar.gz") ? ".tar.gz" : extname(path)
          );
          const uniqueName = await createPath(zipFolderName, directory);
          const objectReaders = unzippedFiles.map<ObjectReader>(
            ([extractPath, fileContents]) => {
              let aborted = false;

              return {
                abort: () => {
                  aborted = true;
                },
                directory: join(directory, uniqueName),
                done: () => updateFolder(directory, uniqueName),
                name: extractPath,
                operation: "Extracting",
                read: async () => {
                  if (aborted) return;

                  try {
                    const localPath = join(directory, uniqueName, extractPath);

                    if (
                      fileContents.length === 0 &&
                      extractPath.endsWith("/")
                    ) {
                      await mkdir(localPath);
                    } else {
                      if (!(await exists(dirname(localPath)))) {
                        await mkdirRecursive(dirname(localPath));
                      }

                      await writeFile(localPath, Buffer.from(fileContents));
                    }
                  } catch {
                    // Ignore failure to extract
                  }
                },
              };
            }
          );

          openTransferDialog(objectReaders, path);
        }
      } catch (error) {
        closeDialog();

        if ("message" in (error as Error)) {
          console.error((error as Error).message);
        }
      }
    },
    [
      close,
      createPath,
      directory,
      exists,
      mkdir,
      mkdirRecursive,
      openTransferDialog,
      readFile,
      updateFolder,
      writeFile,
    ]
  );
  const pasteToFolder = useCallback(
    (event?: CaptureTriggerEvent): void => {
      [directory, ...getParentDirectories(directory)].forEach(
        (parentDirectory) =>
          pasteList[parentDirectory] && delete pasteList[parentDirectory]
      );

      const pasteEntries = Object.entries(pasteList);
      const moving = pasteEntries.some(([, operation]) => operation === "move");
      const copyFiles = async (entry: string, basePath = ""): Promise<void> => {
        const newBasePath = join(basePath, basename(entry));
        let uniquePath = "";

        try {
          if ((await lstat(entry)).isDirectory()) {
            uniquePath = await createPath(newBasePath, directory);

            await Promise.all(
              (await readdir(entry)).map((dirEntry) =>
                copyFiles(join(entry, dirEntry), uniquePath)
              )
            );
          } else {
            uniquePath = await createPath(
              newBasePath,
              directory,
              await readFile(entry)
            );
          }
        } catch (error) {
          const { code, path } = error as ApiError;

          if (path && code === "ENOENT") {
            setPasteList(
              ({ [path]: _missingFile, ...currentPasteList }) =>
                currentPasteList
            );
          }
        }

        if (uniquePath && !basePath) updateFolder(directory, uniquePath);
      };
      const objectReaders = pasteEntries.map<ObjectReader>(([pasteEntry]) => {
        let aborted = false;

        return {
          abort: () => {
            aborted = true;
          },
          directory,
          done: () => {
            if (moving) copyEntries([]);
          },
          name: pasteEntry,
          operation: moving ? "Moving" : "Copying",
          read: async () => {
            if (aborted) return;

            if (moving) {
              updateFolder(directory, await createPath(pasteEntry, directory));
            } else await copyFiles(pasteEntry);
          },
        };
      });

      if (event) {
        const { clientX: x, clientY: y } =
          "TouchEvent" in window && event.nativeEvent instanceof TouchEvent
            ? event.nativeEvent.touches[0]
            : (event.nativeEvent as MouseEvent);

        getIteratedNames(
          pasteEntries.map(([entry]) => basename(entry)),
          directory,
          iconPositions,
          exists
        ).then((entries) =>
          updateIconPositions(
            directory,
            event.target as HTMLElement,
            iconPositions,
            sortOrders,
            { x, y },
            entries,
            setIconPositions,
            exists
          )
        );
      }

      if (
        moving &&
        pasteEntries.some(([entry]) => dirname(entry) === DESKTOP_PATH)
      ) {
        saveUnpositionedDesktopIcons(setIconPositions);
      }

      openTransferDialog(objectReaders);
    },
    [
      copyEntries,
      createPath,
      directory,
      exists,
      iconPositions,
      lstat,
      openTransferDialog,
      pasteList,
      readFile,
      readdir,
      setIconPositions,
      setPasteList,
      sortOrders,
      updateFolder,
    ]
  );
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
      setIsLoading(true);
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
