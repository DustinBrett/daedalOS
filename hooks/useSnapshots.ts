import { dirname, join } from "path";
import { useFileSystemActions } from "contexts/fileSystem";
import { ICON_CACHE, ICON_CACHE_EXTENSION, SAVE_PATH } from "utils/constants";

type Snapshot = {
  createSnapshot: (
    name: string,
    data: Buffer,
    icon?: (() => Promise<Buffer | undefined>) | Buffer,
    overwrite?: boolean,
    savePath?: string
  ) => Promise<string>;
};

// Outside the hook, as value blocks in a try block can't be compiled
const createSnapshotWith =
  ({
    createPath,
    updateFolder,
  }: ReturnType<typeof useFileSystemActions>): Snapshot["createSnapshot"] =>
  async (name, data, icon, overwrite = true, savePath = SAVE_PATH) => {
    let saveName = "";

    try {
      saveName = await createPath(name, savePath, data, undefined, overwrite);

      if (saveName && icon) {
        try {
          const cacheIcon = typeof icon === "function" ? await icon() : icon;

          if (cacheIcon) {
            await createPath(
              `${join(savePath, saveName)}${ICON_CACHE_EXTENSION}`,
              ICON_CACHE,
              cacheIcon,
              undefined,
              overwrite
            );
          }
        } catch {
          // Ignore failure to save icon
        }
      }

      updateFolder(dirname(savePath));
      updateFolder(savePath, saveName);
    } catch {
      // Ignore failure to save snapshot
    }

    return saveName;
  };

export const useSnapshots = (): Snapshot => ({
  createSnapshot: createSnapshotWith(useFileSystemActions()),
});
