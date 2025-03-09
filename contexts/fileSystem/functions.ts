import { join } from "path";
import type HTTPRequest from "browserfs/dist/node/backend/HTTPRequest";
import type IndexedDBFileSystem from "browserfs/dist/node/backend/IndexedDB";
import type OverlayFS from "browserfs/dist/node/backend/OverlayFS";
import type InMemoryFileSystem from "browserfs/dist/node/backend/InMemory";
import { type FileSystemObserver } from "contexts/fileSystem/useFileSystemContextState";
import { FS_HANDLES } from "utils/constants";
import { type RootFileSystem } from "contexts/fileSystem/useAsyncFs";
import {
  KEYVAL_STORE_NAME,
  getFileSystemHandles,
  getKeyValStore,
  supportsIndexedDB,
} from "contexts/fileSystem/core";

const KNOWN_IDB_DBS = [
  "/classicube",
  "/data/saves",
  "ejs-bios",
  "ejs-roms",
  "ejs-romsdata",
  "ejs-states",
  "ejs-system",
  "js-dos-cache (emulators-ui-saves)",
  "keyval-store",
];

const observers = new Map<string, FileSystemObserver>();

export const addFileSystemHandle = async (
  directory: string,
  handle: FileSystemDirectoryHandle,
  mappedName: string,
  observer?: FileSystemObserver
): Promise<void> => {
  if (!(await supportsIndexedDB())) return;

  const db = await getKeyValStore();
  const dirPath = join(directory, mappedName);

  try {
    await db.put(
      KEYVAL_STORE_NAME,
      {
        ...(await getFileSystemHandles()),
        [dirPath]: handle,
      },
      FS_HANDLES
    );

    if (observer) observers.set(dirPath, observer);
  } catch {
    // Ignore errors storing handle
  }
};

export const removeFileSystemHandle = async (
  directory: string
): Promise<void> => {
  if (!(await supportsIndexedDB())) return;

  const { [directory]: _removedHandle, ...handles } =
    await getFileSystemHandles();
  const db = await getKeyValStore();

  try {
    await db.put(KEYVAL_STORE_NAME, handles, FS_HANDLES);

    observers.get(directory)?.disconnect();
    observers.delete(directory);
  } catch {
    // Ignore errors storing handle
  }
};

export const requestPermission = async (
  url: string
): Promise<PermissionState | false> => {
  const fsHandles = await getFileSystemHandles();
  const handle = fsHandles[url];

  if (handle) {
    const currentPermissions = await handle.queryPermission();

    if (currentPermissions === "prompt") {
      await handle.requestPermission();
    } else if (currentPermissions === "granted") {
      throw new Error("Permission already granted");
    }

    return handle.queryPermission();
  }

  return false;
};

export const resetStorage = (rootFs?: RootFileSystem): Promise<void> =>
  new Promise((resolve, reject) => {
    setTimeout(reject, 750);

    window.localStorage.clear();
    window.sessionStorage.clear();

    const clearFs = (): void => {
      const overlayFs = rootFs?._getFs("/")?.fs as OverlayFS;
      const overlayedFileSystems = overlayFs?.getOverlayedFileSystems();
      const readable = overlayedFileSystems?.readable as HTTPRequest;
      const writable = overlayedFileSystems?.writable as
        | IndexedDBFileSystem
        | InMemoryFileSystem;

      readable?.empty();

      if (writable?.getName() === "InMemory" || !writable?.empty) {
        resolve();
      } else {
        writable.empty((apiError) => (apiError ? reject(apiError) : resolve()));
      }
    };

    if (window.indexedDB) {
      import("idb").then(({ deleteDB }) => {
        if (window.indexedDB.databases) {
          window.indexedDB
            .databases()
            .then((databases) =>
              databases
                .filter(({ name }) => name && name !== "browserfs")
                .forEach(({ name }) => deleteDB(name as string))
            )
            .then(clearFs)
            .catch(clearFs);
        } else {
          KNOWN_IDB_DBS.forEach((name) => deleteDB(name));
          clearFs();
        }
      });
    } else {
      clearFs();
    }
  });
