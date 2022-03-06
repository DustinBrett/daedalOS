import { get } from "idb-keyval";
import { join } from "path";
import { FS_HANDLES } from "utils/constants";

export const supportsIndexedDB = (): Promise<boolean> =>
  new Promise((resolve) => {
    const db = window.indexedDB.open("");

    db.addEventListener("error", () => resolve(false));
    db.addEventListener("success", () => resolve(true));
  });

export const getFileSystemHandles = async (): Promise<
  Record<string, FileSystemDirectoryHandle>
> => ((await supportsIndexedDB()) ? (await get(FS_HANDLES)) || {} : {});

export const addFileSystemHandle = async (
  directory: string,
  handle: FileSystemDirectoryHandle
): Promise<void> => {
  if (!(await supportsIndexedDB())) return;

  const { set } = await import("idb-keyval");

  set(FS_HANDLES, {
    ...(await getFileSystemHandles()),
    [join(directory, handle.name)]: handle,
  });
};

export const removeFileSystemHandle = async (
  directory: string
): Promise<void> => {
  if (!(await supportsIndexedDB())) return;

  const { [directory]: _, ...handles } = await getFileSystemHandles();
  const { set } = await import("idb-keyval");

  set(FS_HANDLES, handles);
};

export const requestPermission = async (
  url: string
): Promise<PermissionState | false> => {
  const fsHandles = await getFileSystemHandles();
  const handle = fsHandles[url];

  if (handle) {
    if ((await handle.queryPermission()) === "prompt") {
      await handle.requestPermission();
    }

    return handle.queryPermission();
  }

  return false;
};
