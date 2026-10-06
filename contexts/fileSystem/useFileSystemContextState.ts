import { basename, dirname, isAbsolute, join } from "path";
import type * as IBrowserFS from "browserfs";
import type IIsoFS from "browserfs/dist/node/backend/IsoFS";
import type IZipFS from "browserfs/dist/node/backend/ZipFS";
import { type ApiError } from "browserfs/dist/node/core/api_error";
import {
  type BFSCallback,
  type FileSystem,
} from "browserfs/dist/node/core/file_system";
import { type FSModule } from "browserfs/dist/node/core/FS";
import { useEffect, useRef, useState } from "react";
import useTransferDialog from "components/system/Dialogs/Transfer/useTransferDialog";
import {
  getEventData,
  handleFileInputEvent,
  type InputChangeEvent,
  iterateFileName,
  removeInvalidFilenameCharacters,
} from "components/system/Files/FileManager/functions";
import { type NewPath } from "components/system/Files/FileManager/useFolder";
import {
  type FS9PV4,
  getFileSystemHandles,
  hasIndexedDB,
  isMountedFolder,
  KEYVAL_DB,
  parseDirectory,
} from "contexts/fileSystem/core";
import useAsyncFs, {
  type AsyncFS,
  type EmscriptenFS,
  type ExtendedEmscriptenFileSystem,
  type RootFileSystem,
} from "contexts/fileSystem/useAsyncFs";
import { useProcessesActions } from "contexts/process";
import { type UpdateFiles } from "contexts/session/types";
import {
  CLIPBOARD_FILE_EXTENSIONS,
  DEFAULT_MAPPED_NAME,
  DESKTOP_PATH,
  PROCESS_DELIMITER,
  TRANSITIONS_IN_MILLISECONDS,
} from "utils/constants";
import { bufferToBlob, getExtension, getMimeType } from "utils/functions";
import { loadFileSystemFunctions } from "utils/loaders";

export type FileSystemObserver = {
  disconnect: () => void;
  observe: (
    handle: FileSystemDirectoryHandle,
    options: { recursive: boolean }
  ) => Promise<void>;
};

type FileSystemChangeRecord = {
  relativePathComponents: string[];
  relativePathMovedFrom: null | string[];
  type: "appeared" | "disappeared" | "moved";
};

declare global {
  interface Window {
    FileSystemObserver: new (
      callback: (records: FileSystemChangeRecord[]) => void
    ) => FileSystemObserver;
  }
}

type FilePasteOperations = Record<string, "copy" | "move">;

type FileSystemWatchers = Record<string, UpdateFiles[]>;

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

export type FileSystemContextState = {
  fs?: FSModule;
  pasteList: FilePasteOperations;
  rootFs?: RootFileSystem;
};

type FileSystemContextActions = AsyncFS & {
  addFile: (
    directory: string,
    callback: NewPath,
    accept?: string,
    multiple?: boolean
  ) => Promise<string[]>;
  addFsWatcher: (folder: string, updateFiles: UpdateFiles) => void;
  copyEntries: (entries: string[]) => void;
  createPath: (
    name: string,
    directory: string,
    buffer?: Buffer,
    iteration?: number,
    overwrite?: boolean
  ) => Promise<string>;
  deletePath: (path: string) => Promise<boolean>;
  mapFs: (
    directory: string,
    existingHandle?: FileSystemDirectoryHandle
  ) => Promise<string>;
  mkdirRecursive: (path: string) => Promise<void>;
  mountEmscriptenFs: (FS: EmscriptenFS, fsName?: string) => Promise<string>;
  mountFs: (url: string) => Promise<void>;
  mountHttpRequestFs: (
    mountPoint: string,
    url: string,
    baseUrl?: string
  ) => Promise<void>;
  moveEntries: (entries: string[]) => void;
  removeFsWatcher: (folder: string, updateFiles: UpdateFiles) => void;
  setPasteList: React.Dispatch<React.SetStateAction<FilePasteOperations>>;
  unMapFs: (directory: string, hasNoHandle?: boolean) => Promise<void>;
  unMountFs: (url: string) => void;
  updateFolder: (
    folder: string,
    newFile?: string,
    oldFile?: string
  ) => Promise<void>;
};

const SYSTEM_DIRECTORIES = new Set(["/OPFS"]);

const loadBrowserFs = (): Promise<unknown> =>
  import("public/System/BrowserFS/browserfs.min.js");

const loadExtraFs = (): Promise<unknown> =>
  import("public/System/BrowserFS/extrafs.min.js");

const getDirectoryHandle = async (
  directory: string,
  existingHandle?: FileSystemDirectoryHandle
): Promise<FileSystemDirectoryHandle | undefined> => {
  try {
    return (
      existingHandle ??
      (await (SYSTEM_DIRECTORIES.has(directory)
        ? navigator.storage.getDirectory()
        : window.showDirectoryPicker({
            id: "MapDirectoryPicker",
            mode: "readwrite",
            startIn: "desktop",
          })))
    );
  } catch {
    // Ignore cancelling the dialog
    return undefined;
  }
};

const useFileSystemContextState = (): {
  actions: FileSystemContextActions;
  state: FileSystemContextState;
} => {
  const {
    exists,
    fs,
    lstat,
    mkdir,
    readdir,
    readFile,
    rename,
    rmdir,
    rootFs,
    stat,
    unlink,
    writeFile,
  } = useAsyncFs();
  const { closeWithTransition } = useProcessesActions();
  const fsWatchersRef = useRef<FileSystemWatchers>(
    Object.create(null) as FileSystemWatchers
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
  const copyToClipboard = (entry: string): void => {
    if (!CLIPBOARD_FILE_EXTENSIONS.has(getExtension(entry))) return;

    let type = getMimeType(entry);

    if (!type) return;

    // Bypass "Type image/jpeg not supported on write."
    if (type === "image/jpeg") type = "image/png";

    if (navigator.clipboard?.write) {
      try {
        navigator.clipboard.write([
          new ClipboardItem({
            [type]: readFile(entry).then((buffer) =>
              bufferToBlob(buffer, type)
            ),
          }),
        ]);
      } catch {
        // Ignore failure to copy image to clipboard
      }
    }
  };
  const copyEntries = (entries: string[]): void => {
    if (entries.length === 1) copyToClipboard(entries[0]);
    updatePasteEntries(entries, "copy");
  };
  const moveEntries = (entries: string[]): void =>
    updatePasteEntries(entries, "move");
  const addFsWatcher = (folder: string, updateFiles: UpdateFiles): void => {
    fsWatchersRef.current[folder] = [
      ...(fsWatchersRef.current[folder] || []),
      updateFiles,
    ];
  };
  const unusedMountsCleanupTimerRef = useRef(0);
  const cleanupUnusedMounts = (secondCheck?: boolean): void => {
    if (rootFs) {
      const mountedPaths = Object.keys(rootFs.mntMap || {}).filter(
        (mountedPath) => mountedPath !== "/"
      );

      if (mountedPaths.length === 0) return;

      const watchedPaths = Object.keys(fsWatchersRef.current).filter(
        (watchedPath) => fsWatchersRef.current[watchedPath].length > 0
      );

      mountedPaths.forEach((mountedPath) => {
        if (
          !watchedPaths.some((watchedPath) =>
            watchedPath.startsWith(mountedPath)
          ) &&
          !isMountedFolder(rootFs.mntMap[mountedPath])
        ) {
          if (secondCheck) {
            rootFs.umount?.(mountedPath);
          } else {
            unusedMountsCleanupTimerRef.current = window.setTimeout(
              () => cleanupUnusedMounts(true),
              TRANSITIONS_IN_MILLISECONDS.WINDOW
            );
          }
        }
      });
    }
  };
  const removeFsWatcher = (folder: string, updateFiles: UpdateFiles): void => {
    fsWatchersRef.current[folder] = (
      fsWatchersRef.current[folder] || []
    ).filter((updateFilesInstance) => updateFilesInstance !== updateFiles);

    if (unusedMountsCleanupTimerRef.current) {
      window.clearTimeout(unusedMountsCleanupTimerRef.current);
    }
    unusedMountsCleanupTimerRef.current = window.setTimeout(
      cleanupUnusedMounts,
      TRANSITIONS_IN_MILLISECONDS.WINDOW
    );
  };
  const updateFolder = async (
    folder: string,
    newFile?: string,
    oldFile?: string
  ): Promise<void> => {
    const folderWatchers = fsWatchersRef.current[folder];

    if (folderWatchers) {
      await Promise.all(
        folderWatchers.map((updateFiles) => updateFiles(newFile, oldFile))
      );
    }
  };
  const mountEmscriptenFs = async (
    FS: EmscriptenFS,
    fsName?: string
  ): Promise<string> =>
    new Promise<string>((resolve, reject) => {
      loadExtraFs().then((ExtraFS) => {
        const {
          FileSystem: { Emscripten },
        } = ExtraFS as typeof IBrowserFS;

        Emscripten?.Create({ FS }, (error, newFs) => {
          const emscriptenFS = newFs as unknown as ExtendedEmscriptenFileSystem;

          if (error || !newFs || !emscriptenFS._FS?.DB_NAME) {
            reject(new Error("Error while mounting Emscripten FS."));
            return;
          }

          const dbName =
            fsName ||
            `${emscriptenFS._FS?.DB_NAME().replace(/\/+$/, "")}${
              emscriptenFS._FS?.DB_STORE_NAME
            }`;

          if (rootFs?.mount) {
            try {
              rootFs.mount(join("/", dbName), newFs);
            } catch {
              // Ignore error during mounting
            }
          }

          resolve(dbName);
        });
      });
    });
  const mountHttpRequestFs = async (
    mountPoint: string,
    url: string,
    baseUrl?: string
  ): Promise<void> => {
    const index = (await (await fetch(url)).json()) as object;

    if (!(typeof index === "object" && "fsroot" in index)) {
      throw new Error("Invalid HTTPRequest FS object.");
    }

    const {
      FileSystem: { HTTPRequest },
    } = (await loadBrowserFs()) as typeof IBrowserFS;

    return new Promise((resolve, reject) => {
      HTTPRequest?.Create(
        { baseUrl, index: parseDirectory(index.fsroot as FS9PV4[]) },
        (error, newFs) => {
          if (error || !newFs) {
            reject(new Error("Error while mounting HTTPRequest FS."));
          } else {
            rootFs?.mount?.(mountPoint, newFs);
            resolve();
          }
        }
      );
    });
  };
  const mapFs = async (
    directory: string,
    existingHandle?: FileSystemDirectoryHandle
  ): Promise<string> => {
    const handle = await getDirectoryHandle(directory, existingHandle);

    return new Promise((resolve, reject) => {
      if (handle instanceof FileSystemDirectoryHandle) {
        loadExtraFs().then((ExtraFS) => {
          const {
            FileSystem: { FileSystemAccess },
          } = ExtraFS as IFileSystemAccess;

          FileSystemAccess?.Create({ handle }, (error, newFs) => {
            if (error || !newFs) {
              reject(new Error("Error while mounting FileSystemAccess FS."));
              return;
            }

            const systemDirectory = SYSTEM_DIRECTORIES.has(directory);
            const mappedName =
              removeInvalidFilenameCharacters(handle.name).trim() ||
              (systemDirectory ? "" : DEFAULT_MAPPED_NAME);
            const mappedPath = join(directory, mappedName);

            rootFs?.mount?.(mappedPath, newFs);
            resolve(systemDirectory ? directory : mappedName);

            let observer: FileSystemObserver | undefined;

            if ("FileSystemObserver" in window) {
              observer = new window.FileSystemObserver(([record]) => {
                const { relativePathComponents, relativePathMovedFrom, type } =
                  record;
                let newFile = "";
                let oldFile = "";

                if (type === "appeared") {
                  newFile =
                    relativePathComponents[relativePathComponents.length - 1];
                } else if (type === "disappeared") {
                  oldFile =
                    relativePathComponents[relativePathComponents.length - 1];
                } else if (relativePathMovedFrom && type === "moved") {
                  oldFile =
                    relativePathMovedFrom[relativePathMovedFrom.length - 1];
                  newFile =
                    relativePathComponents[relativePathComponents.length - 1];
                }

                if (newFile || oldFile) {
                  updateFolder(
                    join(mappedPath, ...relativePathComponents.slice(0, -1)),
                    newFile,
                    oldFile
                  );
                }
              });

              try {
                observer.observe(handle, { recursive: true });
              } catch {
                observer = undefined;
              }
            }

            loadFileSystemFunctions().then(({ addFileSystemHandle }) =>
              addFileSystemHandle(
                directory,
                systemDirectory ? undefined : handle,
                mappedName,
                observer
              )
            );
          });
        });
      } else {
        reject(new Error("Unsupported FileSystemDirectoryHandle type."));
      }
    });
  };
  const mountFs = async (url: string): Promise<void> => {
    const fileData = await readFile(url);

    return new Promise((resolve, reject) => {
      const isIso = getExtension(url) === ".iso";
      const createFs: BFSCallback<IIsoFS | IZipFS> = (createError, newFs) => {
        if (createError) {
          reject(
            new Error(`Error while mounting ${isIso ? "ISO" : "ZIP"} FS.`)
          );
        } else if (newFs) {
          rootFs?.mount?.(url, newFs);
          resolve();
        }
      };

      loadExtraFs().then((ExtraFS) => {
        const {
          FileSystem: { IsoFS, ZipFS },
        } = ExtraFS as typeof IBrowserFS;

        if (isIso) {
          IsoFS?.Create({ data: fileData }, createFs);
        } else {
          ZipFS?.Create({ zipData: fileData }, createFs);
        }
      });
    });
  };
  const unMountFs = (url: string): void => rootFs?.umount?.(url);
  const unMapFs = async (
    directory: string,
    hasNoHandle?: boolean
  ): Promise<void> => {
    unMountFs(directory);
    updateFolder(dirname(directory), undefined, directory);

    if (hasNoHandle) return;

    const { removeFileSystemHandle } = await loadFileSystemFunctions();

    removeFileSystemHandle(directory);
  };
  const { openTransferDialog } = useTransferDialog(readFile);
  const addFile = (
    directory: string,
    callback: NewPath,
    accept?: string,
    multiple = true
  ): Promise<string[]> =>
    new Promise((resolve) => {
      const fileInput = document.createElement("input");

      fileInput.type = "file";
      fileInput.multiple = multiple;
      if (accept) fileInput.accept = accept;
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

          const { files } = getEventData(event as InputChangeEvent);

          if (files) {
            resolve(
              [...files].map((file) =>
                files instanceof FileList
                  ? (file as File).name
                  : (
                      (
                        file as DataTransferItem
                      ).webkitGetAsEntry() as FileSystemEntry
                    ).name
              )
            );
          }

          fileInput.remove();
        },
        { once: true }
      );
      document.body.append(fileInput);
      fileInput.click();
    });
  const mkdirRecursive = async (path: string): Promise<void> => {
    const pathParts = path.split("/").filter(Boolean);
    const recursePath = async (position = 1, retry = 0): Promise<void> => {
      const makePath = join("/", pathParts.slice(0, position).join("/"));
      let created = false;

      try {
        created = await exists(makePath);

        if (!created) created = await mkdir(makePath);
      } catch {
        // Ignore failure to create path
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
  };
  const deletePath = async (path: string): Promise<boolean> => {
    let deleted = false;

    try {
      deleted = await unlink(path);
    } catch (error) {
      if ((error as ApiError).code === "EISDIR") {
        const dirContents = await readdir(path);

        await Promise.all(
          dirContents.map((entry) => deletePath(join(path, entry)))
        );
        deleted = await rmdir(path);
      }
    }

    if (Object.keys(fsWatchersRef.current || {}).includes(path)) {
      closeWithTransition(`FileExplorer${PROCESS_DELIMITER}${path}`);
    }

    return deleted;
  };
  const createPath = async (
    name: string,
    directory: string,
    buffer?: Buffer,
    iteration = 0,
    overwrite = false
  ): Promise<string> => {
    if (!name.trim()) return "";

    const isInternal = !buffer && isAbsolute(name);
    const baseName = isInternal ? basename(name) : name;
    const uniqueName = iteration
      ? iterateFileName(baseName, iteration)
      : baseName;
    const fullNewPath = join(directory, uniqueName);

    if (isInternal) {
      if (
        name !== fullNewPath &&
        directory !== name &&
        !directory.startsWith(`${name}/`) &&
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

      const created = buffer
        ? writeFile(fullNewPath, buffer, overwrite)
        : mkdir(fullNewPath);

      try {
        if (await created) return uniqueName;
      } catch (error) {
        if ((error as ApiError)?.code === "EEXIST") {
          return createPath(name, directory, buffer, iteration + 1);
        }
      }
    }

    return "";
  };
  const restoredFsHandles = useRef(false);

  useEffect(() => {
    if (!restoredFsHandles.current && rootFs) {
      const restoreFsHandles = async (): Promise<void> => {
        restoredFsHandles.current = true;

        let mappedOntoDesktop = false;

        if (await hasIndexedDB(KEYVAL_DB)) {
          await Promise.all(
            Object.entries(await getFileSystemHandles()).map(
              async ([handleDirectory, handle]) => {
                if (!(await exists(handleDirectory))) {
                  const mapDirectory = SYSTEM_DIRECTORIES.has(handleDirectory)
                    ? handleDirectory
                    : dirname(handleDirectory);

                  try {
                    await mapFs(mapDirectory, handle);

                    if (mapDirectory === DESKTOP_PATH) mappedOntoDesktop = true;
                  } catch {
                    // Ignore failure
                  }
                }
              }
            )
          );
        }

        if (mappedOntoDesktop) updateFolder(DESKTOP_PATH);
      };

      restoreFsHandles();
    }
  }, [exists, mapFs, rootFs, updateFolder]);

  const actions = {
    addFile,
    addFsWatcher,
    copyEntries,
    createPath,
    deletePath,
    exists,
    lstat,
    mapFs,
    mkdir,
    mkdirRecursive,
    mountEmscriptenFs,
    mountFs,
    mountHttpRequestFs,
    moveEntries,
    readdir,
    readFile,
    removeFsWatcher,
    rename,
    rmdir,
    setPasteList,
    stat,
    unlink,
    unMapFs,
    unMountFs,
    updateFolder,
    writeFile,
  };
  const state = { fs, pasteList, rootFs };

  return { actions, state };
};

export default useFileSystemContextState;
