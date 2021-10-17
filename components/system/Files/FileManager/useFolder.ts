import type { ApiError } from "browserfs/dist/node/core/api_error";
import type { BFSCallback } from "browserfs/dist/node/core/file_system";
import type Stats from "browserfs/dist/node/core/node_fs_stats";
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
import { zip } from "fflate";
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
import { unzip } from "utils/zipFunctions";

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
  newPath: (path: string, buffer?: Buffer, rename?: boolean) => Promise<string>;
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
    exists,
    fs,
    mkdir,
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
    async (fileNames: string[]): Promise<Files> =>
      Object.fromEntries(
        await Promise.all(
          fileNames.map(
            async (file): Promise<FileStats> => [
              file,
              await statsWithShortcutInfo(
                file,
                await stat(join(directory, file))
              ),
            ]
          )
        )
      ),
    [directory, stat, statsWithShortcutInfo]
  );
  const updateFiles = useCallback(
    async (newFile?: string, oldFile?: string, initialOrder?: string[]) => {
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
          const dirContents = await readdir(directory);
          const updatedFiles = await getFiles(
            dirContents.filter(filterSystemFiles(directory))
          );

          setFiles((currentFiles = {}) =>
            sortContents(
              updatedFiles,
              initialOrder || Object.keys(currentFiles)
            )
          );
        } catch (error) {
          if ((error as ApiError).code === "ENOENT") {
            closeWithTransition(
              close,
              `FileExplorer${PROCESS_DELIMITER}${directory}`
            );
          }
        }

        setLoading(false);
      }
    },
    [close, directory, getFiles, readdir, stat, statsWithShortcutInfo]
  );
  const deletePath = async (path: string, updatePath = true): Promise<void> => {
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
    findPathsRecursive(paths, readdir, stat).then((allPaths) =>
      Promise.all(allPaths.map((path) => getFile(path))).then((filePaths) => {
        const zipFiles = filePaths.filter(Boolean);

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
  const newPath = async (
    name: string,
    buffer?: Buffer,
    thenRename = false,
    iteration = 0
  ): Promise<string> => {
    const isInternal = !buffer && isAbsolute(name);
    const baseName = isInternal ? basename(name) : name;
    const uniqueName = !iteration
      ? baseName
      : iterateFileName(baseName, iteration);
    const fullNewPath = join(directory, uniqueName);

    if (isInternal) {
      if (name !== fullNewPath) {
        if (await exists(fullNewPath)) {
          return newPath(name, buffer, thenRename, iteration + 1);
        }

        if (await rename(name, fullNewPath)) {
          updateFolder(directory, uniqueName);
          updateFolder(dirname(name), "", name);
          blurEntry();
          focusEntry(uniqueName);

          return uniqueName;
        }
      }
    } else {
      try {
        if (
          buffer
            ? await writeFile(fullNewPath, buffer)
            : await mkdir(fullNewPath)
        ) {
          if (!uniqueName.includes("/")) {
            updateFolder(directory, uniqueName);

            if (thenRename) setRenaming(uniqueName);
            else focusEntry(uniqueName);
          }

          return uniqueName;
        }
      } catch (error) {
        if ((error as ApiError)?.code === "EEXIST") {
          return newPath(name, buffer, thenRename, iteration + 1);
        }
      }
    }

    return "";
  };

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
    findPathsRecursive(paths, readdir, stat).then((allPaths) =>
      Promise.all(allPaths.map((path) => getFile(path))).then((filePaths) => {
        const zipFiles = filePaths.filter(Boolean);

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
  const extractFiles = async (path: string): Promise<void> => {
    const unzippedFiles = await unzip(await readFile(path));
    const zipFolderName = basename(path, extname(path));

    if (await mkdir(join(directory, zipFolderName))) {
      await Promise.all(
        Object.entries(unzippedFiles).map(
          async ([extractPath, fileContents]): Promise<boolean> => {
            const localPath = join(directory, zipFolderName, extractPath);

            if (fileContents.length === 0 && extractPath.endsWith("/")) {
              return mkdir(localPath);
            }

            const fileData = Buffer.from(fileContents);
            let created = false;

            try {
              created = await writeFile(localPath, fileData);
            } catch (error) {
              const { code, path: missingPath } = error as ApiError;

              if (code === "ENOENT" && missingPath) {
                return (
                  (await mkdir(missingPath)) && writeFile(localPath, fileData)
                );
              }
            }

            return created;
          }
        )
      );
      updateFolder(directory, zipFolderName);
    }
  };
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
      deletePath,
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
