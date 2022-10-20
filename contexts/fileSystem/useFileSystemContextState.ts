import type * as IBrowserFS from "browserfs";
import type IIsoFS from "browserfs/dist/node/backend/IsoFS";
import type IZipFS from "browserfs/dist/node/backend/ZipFS";
import type { ApiError } from "browserfs/dist/node/core/api_error";
import type {
  BFSCallback,
  FileSystem,
} from "browserfs/dist/node/core/file_system";
import type { FSModule } from "browserfs/dist/node/core/FS";
import useTransferDialog from "components/system/Dialogs/Transfer/useTransferDialog";
import type { InputChangeEvent } from "components/system/Files/FileManager/functions";
import {
  handleFileInputEvent,
  iterateFileName,
} from "components/system/Files/FileManager/functions";
import {
  addFileSystemHandle,
  getFileSystemHandles,
  removeFileSystemHandle,
} from "contexts/fileSystem/functions";
import type { AsyncFS, RootFileSystem } from "contexts/fileSystem/useAsyncFs";
import useAsyncFs from "contexts/fileSystem/useAsyncFs";
import type { UpdateFiles } from "contexts/session/types";
import { basename, dirname, extname, isAbsolute, join } from "path";
import * as BrowserFS from "public/System/BrowserFS/browserfs.min.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_MAPPED_NAME, INVALID_FILE_CHARACTERS } from "utils/constants";

type FilePasteOperations = Record<string, "copy" | "move">;

type IFileSystemAccess = {
  FileSystem: {
    FileSystemAccess: {
      Create: (
        opts: { handle: FileSystemDirectoryHandle },
        cb: BFSCallback<FileSystem>
      ) => void;
    };
  };
};

export type FileSystemContextState = AsyncFS & {
  addFile: (
    directory: string,
    callback: (name: string, buffer?: Buffer) => void,
    accept?: string,
    multiple?: boolean
  ) => void;
  addFsWatcher: (folder: string, updateFiles: UpdateFiles) => void;
  copyEntries: (entries: string[]) => void;
  createPath: (
    name: string,
    directory: string,
    buffer?: Buffer
  ) => Promise<string>;
  deletePath: (path: string) => Promise<void>;
  fs?: FSModule;
  mapFs: (directory: string) => Promise<string>;
  mkdirRecursive: (path: string) => Promise<void>;
  mountFs: (url: string) => Promise<void>;
  moveEntries: (entries: string[]) => void;
  pasteList: FilePasteOperations;
  removeFsWatcher: (folder: string, updateFiles: UpdateFiles) => void;
  rootFs?: RootFileSystem;
  unMapFs: (directory: string) => void;
  unMountFs: (url: string) => void;
  updateFolder: (folder: string, newFile?: string, oldFile?: string) => void;
};

const {
  FileSystem: { FileSystemAccess, IsoFS, ZipFS },
} = BrowserFS as IFileSystemAccess & typeof IBrowserFS;

const useFileSystemContextState = (): FileSystemContextState => {
  const asyncFs = useAsyncFs();
  const {
    exists,
    mkdir,
    readdir,
    readFile,
    rename,
    rmdir,
    rootFs,
    unlink,
    writeFile,
  } = asyncFs;
  const [fsWatchers, setFsWatchers] = useState<Record<string, UpdateFiles[]>>(
    {}
  );
  const [pasteList, setPasteList] = useState<FilePasteOperations>(
    Object.create(null) as FilePasteOperations
  );
  const updatePasteEntries = (
    entries: string[],
    operation: "copy" | "move"
  ): void =>
    setPasteList(
      Object.fromEntries(entries.map((entry) => [entry, operation]))
    );
  const copyEntries = useCallback(
    (entries: string[]): void => updatePasteEntries(entries, "copy"),
    []
  );
  const moveEntries = useCallback(
    (entries: string[]): void => updatePasteEntries(entries, "move"),
    []
  );
  const addFsWatcher = useCallback(
    (folder: string, updateFiles: UpdateFiles): void =>
      setFsWatchers((currentFsWatcher) => ({
        ...currentFsWatcher,
        [folder]: [...(currentFsWatcher[folder] || []), updateFiles],
      })),
    []
  );
  const removeFsWatcher = useCallback(
    (folder: string, updateFiles: UpdateFiles): void =>
      setFsWatchers((currentFsWatcher) => ({
        ...currentFsWatcher,
        [folder]: (currentFsWatcher[folder] || []).filter(
          (updateFilesInstance) => updateFilesInstance !== updateFiles
        ),
      })),
    []
  );
  const updateFolder = useCallback(
    (folder: string, newFile?: string, oldFile?: string): void =>
      fsWatchers[folder]?.forEach((updateFiles) =>
        updateFiles(newFile, oldFile)
      ),
    [fsWatchers]
  );
  const mapFs = useCallback(
    async (
      directory: string,
      existingHandle?: FileSystemDirectoryHandle
    ): Promise<string> => {
      let handle: FileSystemDirectoryHandle;

      try {
        handle = existingHandle ?? (await window.showDirectoryPicker());
      } catch {
        // Ignore cancelling the dialog
      }

      return new Promise((resolve, reject) => {
        if (handle instanceof FileSystemDirectoryHandle) {
          FileSystemAccess?.Create({ handle }, (error, newFs) => {
            if (error || !newFs) {
              reject();
              return;
            }

            const mappedName =
              handle.name.replace(INVALID_FILE_CHARACTERS, "").trim() ||
              DEFAULT_MAPPED_NAME;

            rootFs?.mount?.(join(directory, mappedName), newFs);
            resolve(mappedName);
            addFileSystemHandle(directory, handle, mappedName);
          });
        } else {
          reject();
        }
      });
    },
    [rootFs]
  );
  const mountFs = useCallback(
    async (url: string): Promise<void> => {
      const fileData = await readFile(url);

      return new Promise((resolve, reject) => {
        const createFs: BFSCallback<IIsoFS | IZipFS> = (createError, newFs) => {
          if (createError) reject();
          else if (newFs) {
            rootFs?.mount?.(url, newFs);
            resolve();
          }
        };

        if (extname(url).toLowerCase() === ".iso") {
          IsoFS?.Create({ data: fileData }, createFs);
        } else {
          ZipFS?.Create({ zipData: fileData }, createFs);
        }
      });
    },
    [readFile, rootFs]
  );
  const unMountFs = useCallback(
    (url: string): void => rootFs?.umount?.(url),
    [rootFs]
  );
  const unMapFs = useCallback(
    (directory: string): void => {
      updateFolder(dirname(directory), undefined, directory);
      removeFileSystemHandle(directory);
      unMountFs(directory);
    },
    [unMountFs, updateFolder]
  );
  const { openTransferDialog } = useTransferDialog();
  const addFile = useCallback(
    (
      directory: string,
      callback: (name: string, buffer?: Buffer) => void
    ): void => {
      const fileInput = document.createElement("input");

      fileInput.type = "file";
      fileInput.multiple = true;
      fileInput.setAttribute("style", "display: none");
      fileInput.addEventListener(
        "change",
        (event) => {
          handleFileInputEvent(
            event as InputChangeEvent,
            callback,
            directory,
            openTransferDialog
          );
          fileInput.remove();
        },
        { once: true }
      );
      document.body.appendChild(fileInput);
      fileInput.click();
    },
    [openTransferDialog]
  );
  const mkdirRecursive = useCallback(
    async (path: string): Promise<void> => {
      const pathParts = path.split("/").filter(Boolean);
      const recursePath = async (position = 1, retry = 0): Promise<void> => {
        const makePath = join("/", pathParts.slice(0, position).join("/"));
        let created: boolean;

        try {
          created = (await exists(makePath)) || (await mkdir(makePath));
        } catch {
          created = false;
        }

        if (created) {
          if (position !== pathParts.length) {
            await recursePath(position + 1);
          }
        } else if (retry < 3) {
          await recursePath(position, retry + 1);
        }
      };

      await recursePath();
    },
    [exists, mkdir]
  );
  const deletePath = useCallback(
    async (path: string): Promise<void> => {
      try {
        await unlink(path);
      } catch (error) {
        if ((error as ApiError).code === "EISDIR") {
          const dirContents = await readdir(path);

          await Promise.all(
            dirContents.map((entry) => deletePath(join(path, entry)))
          );
          await rmdir(path);
        }
      }
    },
    [readdir, rmdir, unlink]
  );
  const createPath = useCallback(
    async (
      name: string,
      directory: string,
      buffer?: Buffer,
      iteration = 0
    ): Promise<string> => {
      const isInternal = !buffer && isAbsolute(name);
      const baseName = isInternal ? basename(name) : name;
      const uniqueName = !iteration
        ? baseName
        : iterateFileName(baseName, iteration);
      const fullNewPath = join(directory, uniqueName);

      if (isInternal) {
        if (
          name !== fullNewPath &&
          !directory.startsWith(name) &&
          !rootFs?.mntMap[name]
        ) {
          if (await exists(fullNewPath)) {
            return createPath(name, directory, buffer, iteration + 1);
          }

          if (await rename(name, fullNewPath)) {
            updateFolder(dirname(name), "", name);
          }

          return uniqueName;
        }
      } else {
        const maybeMakePath = async (makePath: string): Promise<void> => {
          try {
            if (!(await exists(makePath))) {
              await mkdir(makePath);
              updateFolder(dirname(makePath), basename(makePath));
            }
          } catch (error) {
            if ((error as ApiError).code === "ENOENT") {
              await maybeMakePath(dirname(makePath));
              await maybeMakePath(makePath);
            }
          }
        };

        await maybeMakePath(dirname(fullNewPath));

        try {
          if (
            buffer
              ? await writeFile(fullNewPath, buffer)
              : await mkdir(fullNewPath)
          ) {
            return uniqueName;
          }
        } catch (error) {
          if ((error as ApiError)?.code === "EEXIST") {
            return createPath(name, directory, buffer, iteration + 1);
          }
        }
      }

      return "";
    },
    [exists, mkdir, rename, rootFs?.mntMap, updateFolder, writeFile]
  );
  const restoredFsHandles = useRef(false);

  useEffect(() => {
    const restoreFsHandles = async (): Promise<void> => {
      if (!restoredFsHandles.current && rootFs) {
        restoredFsHandles.current = true;

        Object.entries(await getFileSystemHandles()).forEach(
          async ([handleDirectory, handle]) => {
            if (!(await exists(handleDirectory))) {
              try {
                mapFs(dirname(handleDirectory), handle);
              } catch {
                // Ignore failure
              }
            }
          }
        );
      }
    };

    restoreFsHandles();
  }, [exists, mapFs, rootFs]);

  useEffect(() => {
    const mountedPaths = Object.keys(rootFs?.mntMap || {}).filter(
      (mountedPath) => mountedPath !== "/"
    );

    if (mountedPaths.length === 0) return;

    const watchedPaths = Object.keys(fsWatchers).filter(
      (watchedPath) => fsWatchers[watchedPath].length > 0
    );

    mountedPaths.forEach((mountedPath) => {
      if (
        !watchedPaths.some((watchedPath) =>
          watchedPath.startsWith(mountedPath)
        ) &&
        rootFs?.mntMap[mountedPath]?.getName() !== "FileSystemAccess"
      ) {
        rootFs?.umount?.(mountedPath);
      }
    });
  }, [fsWatchers, rootFs]);

  return {
    addFile,
    addFsWatcher,
    copyEntries,
    createPath,
    deletePath,
    mapFs,
    mkdirRecursive,
    mountFs,
    moveEntries,
    pasteList,
    removeFsWatcher,
    unMapFs,
    unMountFs,
    updateFolder,
    ...asyncFs,
  };
};

export default useFileSystemContextState;
