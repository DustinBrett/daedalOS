import type HTTPRequest from "browserfs/dist/node/backend/HTTPRequest";
import type IndexedDBFileSystem from "browserfs/dist/node/backend/IndexedDB";
import type IIsoFS from "browserfs/dist/node/backend/IsoFS";
import type OverlayFS from "browserfs/dist/node/backend/OverlayFS";
import type IZipFS from "browserfs/dist/node/backend/ZipFS";
import type { ApiError } from "browserfs/dist/node/core/api_error";
import type { BFSCallback } from "browserfs/dist/node/core/file_system";
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
  KEYVAL_DB,
  removeFileSystemHandle,
} from "contexts/fileSystem/functions";
import type { AsyncFS, RootFileSystem } from "contexts/fileSystem/useAsyncFs";
import useAsyncFs from "contexts/fileSystem/useAsyncFs";
import type { UpdateFiles } from "contexts/session/types";
import { basename, dirname, extname, isAbsolute, join } from "path";
import { useCallback, useEffect, useState } from "react";

type FilePasteOperations = Record<string, "copy" | "move">;

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
  resetStorage: () => Promise<void>;
  rootFs?: RootFileSystem;
  unMapFs: (directory: string) => void;
  unMountFs: (url: string) => void;
  updateFolder: (folder: string, newFile?: string, oldFile?: string) => void;
};

const useFileSystemContextState = (): FileSystemContextState => {
  const { rootFs, FileSystemAccess, IsoFS, ZipFS, ...asyncFs } = useAsyncFs();
  const { exists, mkdir, readdir, readFile, rename, rmdir, unlink, writeFile } =
    asyncFs;
  const [fsWatchers, setFsWatchers] = useState<Record<string, UpdateFiles[]>>(
    {}
  );
  const [pasteList, setPasteList] = useState<FilePasteOperations>({});
  const updatePasteEntries = (
    entries: string[],
    operation: "copy" | "move"
  ): void =>
    setPasteList(
      Object.fromEntries(entries.map((entry) => [entry, operation]))
    );
  const copyEntries = (entries: string[]): void =>
    updatePasteEntries(entries, "copy");
  const moveEntries = (entries: string[]): void =>
    updatePasteEntries(entries, "move");
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

            rootFs?.mount?.(join(directory, handle.name), newFs);
            resolve(handle.name);
            addFileSystemHandle(directory, handle);
          });
        }
      });
    },
    [FileSystemAccess, rootFs]
  );
  const mountFs = async (url: string): Promise<void> => {
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
  };
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
  const addFile = (
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
  };
  const resetStorage = (): Promise<void> =>
    new Promise((resolve, reject) => {
      localStorage.clear();
      sessionStorage.clear();

      const clearFs = (): void => {
        const overlayFs = rootFs?._getFs("/")?.fs as OverlayFS;
        const overlayedFileSystems = overlayFs?.getOverlayedFileSystems();
        const readable = overlayedFileSystems?.readable as HTTPRequest;
        const writable = overlayedFileSystems?.writable as IndexedDBFileSystem;

        readable?.empty();

        if (writable?.getName() === "InMemory") {
          resolve();
        } else {
          writable?.empty((apiError) =>
            apiError ? reject(apiError) : resolve()
          );
        }
      };

      if (!window.indexedDB.databases) clearFs();
      else {
        import("idb").then(({ deleteDB }) =>
          deleteDB(KEYVAL_DB).then(clearFs).catch(clearFs)
        );
      }
    });
  const mkdirRecursive = async (path: string): Promise<void> => {
    const pathParts = path.split("/").filter(Boolean);
    const recursePath = async (position = 1): Promise<void> => {
      const makePath = join("/", pathParts.slice(0, position).join("/"));
      let created: boolean;

      try {
        created = (await exists(makePath)) || (await mkdir(makePath));
      } catch {
        created = false;
      }

      if (created && position !== pathParts.length) {
        await recursePath(position + 1);
      }
    };

    await recursePath();
  };
  const deletePath = async (path: string): Promise<void> => {
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
  };
  const createPath = async (
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
      const baseDir = dirname(fullNewPath);

      try {
        if (!(await exists(baseDir))) {
          await mkdir(baseDir);
          updateFolder(dirname(baseDir), basename(baseDir));
        }
      } catch {
        // Ignore error to make directory
      }

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
  };
  const restoreFsHandles = useCallback(
    async (): Promise<void> =>
      Object.entries(await getFileSystemHandles()).forEach(
        async ([handleDirectory, handle]) => {
          if (!(await exists(handleDirectory))) {
            mapFs(dirname(handleDirectory), handle);
          }
        }
      ),
    [exists, mapFs]
  );

  useEffect(() => {
    restoreFsHandles();
  }, [restoreFsHandles]);

  useEffect(() => {
    const watchedPaths = Object.keys(fsWatchers).filter(
      (watchedPath) => fsWatchers[watchedPath].length > 0
    );
    const mountedPaths = Object.keys(rootFs?.mntMap || {}).filter(
      (mountedPath) => mountedPath !== "/"
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
    resetStorage,
    rootFs,
    unMapFs,
    unMountFs,
    updateFolder,
    ...asyncFs,
  };
};

export default useFileSystemContextState;
