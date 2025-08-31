import { extname, join } from "path";
import { type openDB } from "idb";
import {
  type Mount,
  type ExtendedEmscriptenFileSystem,
} from "contexts/fileSystem/useAsyncFs";
import index from "public/.index/fs.9p.json";
import {
  FS_HANDLES,
  MOUNTABLE_EXTENSIONS,
  MOUNTABLE_FS_TYPES,
  ONE_TIME_PASSIVE_EVENT,
} from "utils/constants";

type BFSFS = { [key: string]: BFSFS | null };
type FS9PV3 = [
  string,
  number,
  number,
  number,
  number,
  number,
  FS9PV3[] | string,
];
export type FS9PV4 = [string, number, number, FS9PV4[] | undefined];
type FS9P = {
  fsroot: FS9PV3[];
  size: number;
  version: 3;
};

type FileSystemHandles = Record<string, FileSystemDirectoryHandle>;

export const UNKNOWN_SIZE = -1;
export const UNKNOWN_STATE_CODES = new Set(["EIO", "ENOENT"]);
export const KEYVAL_STORE_NAME = "keyval";

export const KEYVAL_DB = `${KEYVAL_STORE_NAME}-store`;

const IDX_SIZE = 1;
const IDX_MTIME = 2;
const IDX_TARGET = 3;
const IDX_FILE_MODE = 33206;
const IDX_DIR_MODE = 16822;
const IDX_UID = 0;
const IDX_GID = 0;
// eslint-disable-next-line unicorn/no-null
const FILE_ENTRY = null;
const fsroot = index.fsroot as FS9PV4[];

const get9pData = (
  path: string,
  pathIndex: typeof IDX_SIZE | typeof IDX_MTIME
): number => {
  let fsPath = fsroot;
  let data = UNKNOWN_SIZE;

  path
    .split("/")
    .filter(Boolean)
    .forEach((pathPart) => {
      const pathBranch = fsPath.find(([name]) => name === pathPart);

      if (pathBranch) {
        const isBranch = Array.isArray(pathBranch[IDX_TARGET]);

        if (!isBranch) data = pathBranch[pathIndex];
        fsPath = isBranch ? (pathBranch[IDX_TARGET] as FS9PV4[]) : [];
      }
    });

  return data;
};

export const get9pModifiedTime = (path: string): number =>
  get9pData(path, IDX_MTIME);

export const get9pSize = (path: string): number => get9pData(path, IDX_SIZE);

export const parseDirectory = (array: FS9PV4[]): BFSFS => {
  const directory: BFSFS = {};

  // eslint-disable-next-line unicorn/no-unreadable-array-destructuring
  for (const [name, , , pathOrArray] of array) {
    directory[name] = Array.isArray(pathOrArray)
      ? parseDirectory(pathOrArray)
      : FILE_ENTRY;
  }

  return directory;
};

export const fs9pToBfs = (): BFSFS => parseDirectory(fsroot);

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
    try {
      const db = window.indexedDB.open("browserfs");

      db.addEventListener(
        "error",
        () => resolve(false),
        ONE_TIME_PASSIVE_EVENT
      );
      db.addEventListener(
        "success",
        ({ target }) => {
          resolve(true);

          try {
            db.result.close();
          } catch {
            // Ignore errors to close database
          }

          const { objectStoreNames } =
            (target as IDBOpenDBRequest)?.result || {};

          if (objectStoreNames?.length === 0) {
            try {
              window.indexedDB.deleteDatabase("browserfs");
            } catch {
              // Ignore errors to delete database
            }
          }
        },
        ONE_TIME_PASSIVE_EVENT
      );
    } catch {
      resolve(false);
    }
  });

export const hasIndexedDB = async (name: string): Promise<boolean> =>
  new Promise((resolve) => {
    try {
      const db = window.indexedDB.open(name);

      db.addEventListener("upgradeneeded", () => {
        db.transaction?.abort();
        resolve(false);
      });
      db.addEventListener("success", () => {
        db.result.close();
        resolve(true);
      });
      db.addEventListener("error", () => resolve(false));
      db.addEventListener("blocked", () => resolve(false));
    } catch {
      resolve(false);
    }
  });

export const getKeyValStore = async (): ReturnType<typeof openDB> =>
  (await import("idb")).openDB(KEYVAL_DB, 1, {
    upgrade: (db) => db.createObjectStore(KEYVAL_STORE_NAME),
  });

export const getFileSystemHandles = async (): Promise<FileSystemHandles> => {
  if (!(await supportsIndexedDB())) {
    return Object.create(null) as FileSystemHandles;
  }

  const db = await getKeyValStore();

  return (
    (await (db.get(
      KEYVAL_STORE_NAME,
      FS_HANDLES
    ) as Promise<FileSystemHandles>)) ||
    (Object.create(null) as FileSystemHandles)
  );
};

export const isMountedFolder = (mount?: Mount): boolean =>
  typeof mount === "object" &&
  (MOUNTABLE_FS_TYPES.has(mount.getName()) ||
    (mount as ExtendedEmscriptenFileSystem)._FS?.DB_STORE_NAME === "FILE_DATA");

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
