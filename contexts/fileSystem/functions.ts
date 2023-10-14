import type HTTPRequest from "browserfs/dist/node/backend/HTTPRequest";
import type IndexedDBFileSystem from "browserfs/dist/node/backend/IndexedDB";
import type OverlayFS from "browserfs/dist/node/backend/OverlayFS";
import {
  KEYVAL_STORE_NAME,
  getFileSystemHandles,
  getKeyValStore,
  supportsIndexedDB,
} from "contexts/fileSystem/core";
import type {
  ExtendedEmscriptenFileSystem,
  Mount,
  RootFileSystem,
} from "contexts/fileSystem/useAsyncFs";
import { extname, join } from "path";
import { FS_HANDLES, MOUNTABLE_EXTENSIONS } from "utils/constants";

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

export const isMountedFolder = (mount?: Mount): boolean =>
  typeof mount === "object" &&
  (mount.getName() === "FileSystemAccess" ||
    (mount as ExtendedEmscriptenFileSystem)._FS?.DB_STORE_NAME === "FILE_DATA");

export const addFileSystemHandle = async (
  directory: string,
  handle: FileSystemDirectoryHandle,
  mappedName: string
): Promise<void> => {
  if (!(await supportsIndexedDB())) return;

  const db = await getKeyValStore();

  try {
    db.put(
      KEYVAL_STORE_NAME,
      {
        ...(await getFileSystemHandles()),
        [join(directory, mappedName)]: handle,
      },
      FS_HANDLES
    );
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

  await db.put(KEYVAL_STORE_NAME, handles, FS_HANDLES);
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
      const writable = overlayedFileSystems?.writable as IndexedDBFileSystem;

      readable?.empty();

      if (writable?.getName() === "InMemory" || !writable?.empty) {
        resolve();
      } else {
        writable.empty((apiError) => (apiError ? reject(apiError) : resolve()));
      }
    };

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
  });

export const getMountUrl = (
  url: string,
  mntMap: Record<string, Mount>
): string | undefined => {
  if (url === "/") return "";
  if (mntMap[url] || MOUNTABLE_EXTENSIONS.has(extname(url))) return url;

  return Object.keys(mntMap)
    .filter((mountedUrl) => mountedUrl !== "/")
    .find(
      (mountedUrl) => url === mountedUrl || url.startsWith(`${mountedUrl}/`)
    );
};
