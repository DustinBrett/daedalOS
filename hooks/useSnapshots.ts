import { dirname, join } from "path";
import { useCallback } from "react";
import { useFileSystem } from "contexts/fileSystem";
import { SAVE_PATH, ICON_CACHE, ICON_CACHE_EXTENSION } from "utils/constants";

type Snapshot = {
  createSnapshot: (
    name: string,
    data: Buffer,
    icon?: Buffer | (() => Promise<Buffer | undefined>),
    overwrite?: boolean,
    savePath?: string
  ) => Promise<string>;
};

export const useSnapshots = (): Snapshot => {
  const { createPath, updateFolder } = useFileSystem();

  return {
    createSnapshot: useCallback(
      async (name, data, icon, overwrite = true, savePath = SAVE_PATH) => {
        let saveName = "";

        try {
          saveName = await createPath(
            name,
            savePath,
            data,
            undefined,
            overwrite
          );

          if (saveName && icon) {
            try {
              const cacheIcon =
                typeof icon === "function" ? await icon() : icon;

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
      },
      [createPath, updateFolder]
    ),
  };
};
