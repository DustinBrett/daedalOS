import { get, set } from "idb-keyval";
import { join } from "path";
import { FS_HANDLES } from "utils/constants";

export const addFileSystemHandle = (
  directory: string,
  handle: FileSystemDirectoryHandle
): Promise<void> =>
  get(FS_HANDLES).then((handles) =>
    set(FS_HANDLES, {
      ...handles,
      [join(directory, handle.name)]: handle,
    })
  );

export const getFileSystemHandles = async (): Promise<
  Record<string, FileSystemDirectoryHandle>
> => (await get(FS_HANDLES)) ?? {};
