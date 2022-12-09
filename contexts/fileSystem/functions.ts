import type HTTPRequest from "browserfs/dist/node/backend/HTTPRequest";
import type IndexedDBFileSystem from "browserfs/dist/node/backend/IndexedDB";
import type OverlayFS from "browserfs/dist/node/backend/OverlayFS";
import type { RootFileSystem } from "contexts/fileSystem/useAsyncFs";
import { openDB } from "idb";
import { join } from "path";
import index from "public/.index/fs.9p.json";
import { FS_HANDLES, ONE_TIME_PASSIVE_EVENT } from "utils/constants";

type BFSFS = { [key: string]: BFSFS | null };
type FS9PV3 = [
  string,
  number,
  number,
  number,
  number,
  number,
  FS9PV3[] | string
];
type FS9PV4 = [string, number, number, FS9PV4[] | string | undefined];
type FS9P = {
  fsroot: FS9PV3[];
  size: number;
  version: 3;
};

type FileSystemHandles = Record<string, FileSystemDirectoryHandle>;

const KEYVAL_STORE_NAME = "keyval";
const KEYVAL_DB = `${KEYVAL_STORE_NAME}-store`;

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

const IDX_MTIME = 2;
const IDX_TARGET = 3;
const IDX_FILE_MODE = 33206;
const IDX_DIR_MODE = 16822;
const IDX_UID = 0;
const IDX_GID = 0;
// eslint-disable-next-line unicorn/no-null
const FILE_ENTRY = null;
const fsroot = index.fsroot as FS9PV4[];

export const get9pModifiedTime = (path: string): number => {
  let fsPath = fsroot;
  let mTime = 0;

  path
    .split("/")
    .filter(Boolean)
    .forEach((pathPart) => {
      const pathBranch = fsPath.find(([name]) => name === pathPart);

      if (pathBranch) {
        const isBranch = Array.isArray(pathBranch[IDX_TARGET]);

        if (!isBranch) mTime = pathBranch[IDX_MTIME];
        fsPath = isBranch ? (pathBranch[IDX_TARGET] as FS9PV4[]) : [];
      }
    });

  return mTime;
};

const mapReduce9pArray = (
  array: FS9PV4[],
  mapper: (entry: FS9PV4) => BFSFS
  // eslint-disable-next-line unicorn/no-array-callback-reference
): BFSFS => array.map(mapper).reduce((a, b) => Object.assign(a, b), {});

// eslint-disable-next-line unicorn/no-unreadable-array-destructuring
const parse9pEntry = ([name, , , pathOrArray]: FS9PV4): BFSFS => ({
  [name]: Array.isArray(pathOrArray)
    ? mapReduce9pArray(pathOrArray, parse9pEntry)
    : FILE_ENTRY,
});

export const fs9pToBfs = (): BFSFS => mapReduce9pArray(fsroot, parse9pEntry);

const parse9pV4ToV3 = (fs9p: FS9PV4[], path = "/"): FS9PV3[] =>
  fs9p.map(([name, mtime, size, target]) => {
    const targetPath = join(path, name);
    const isDirectory = Array.isArray(target);
    const newTarget = isDirectory
      ? parse9pV4ToV3(target, targetPath)
      : target || targetPath;

    return [
      name,
      mtime,
      size,
      isDirectory ? IDX_DIR_MODE : IDX_FILE_MODE,
      IDX_UID,
      IDX_GID,
      newTarget,
    ] as FS9PV3;
  });

export const fs9pV4ToV3 = (): FS9P =>
  index.version === 4
    ? {
        fsroot: parse9pV4ToV3(fsroot),
        size: index.size,
        version: 3,
      }
    : (index as FS9P);

export const supportsIndexedDB = (): Promise<boolean> =>
  new Promise((resolve) => {
    const db = window.indexedDB.open("");

    db.addEventListener("error", () => resolve(false), ONE_TIME_PASSIVE_EVENT);
    db.addEventListener(
      "success",
      () => {
        resolve(true);

        try {
          db.result.close();
          window.indexedDB.deleteDatabase("");
        } catch {
          // Ignore errors to close/delete the test database
        }
      },
      ONE_TIME_PASSIVE_EVENT
    );
  });

const getKeyValStore = (): ReturnType<typeof openDB> =>
  openDB(KEYVAL_DB, 1, {
    upgrade: (db) => db.createObjectStore(KEYVAL_STORE_NAME),
  });

export const getFileSystemHandles = async (): Promise<FileSystemHandles> => {
  if (!(await supportsIndexedDB())) {
    return Object.create(null) as FileSystemHandles;
  }

  const db = await getKeyValStore();

  return (
    (await (<Promise<FileSystemHandles>>(
      db.get(KEYVAL_STORE_NAME, FS_HANDLES)
    ))) || (Object.create(null) as FileSystemHandles)
  );
};

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

      if (writable?.getName() === "InMemory") {
        resolve();
      } else {
        writable?.empty((apiError) =>
          apiError ? reject(apiError) : resolve()
        );
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
