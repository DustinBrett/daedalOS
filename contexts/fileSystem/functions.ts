import { get, set } from "idb-keyval";
import { join } from "path";
import { FS_HANDLES } from "utils/constants";

export const getFileSystemHandles = async (): Promise<
  Record<string, FileSystemDirectoryHandle>
> => (await get(FS_HANDLES)) ?? {};

export const addFileSystemHandle = async (
  directory: string,
  handle: FileSystemDirectoryHandle
): Promise<void> =>
  set(FS_HANDLES, {
    ...(await getFileSystemHandles()),
    [join(directory, handle.name)]: handle,
  });

export const removeFileSystemHandle = async (
  directory: string
): Promise<void> => {
  const { [directory]: _, ...handles } = await getFileSystemHandles();

  set(FS_HANDLES, handles);
};
