import type { FSModule } from "browserfs/dist/node/core/FS";
import type Stats from "browserfs/dist/node/core/node_fs_stats";
import { useMemo } from "react";
import { EMPTY_BUFFER } from "utils/constants";

export type AsyncFSModule = {
  exists: (path: string) => Promise<boolean>;
  mkdir: (path: string, overwrite?: boolean) => Promise<boolean>;
  readFile: (path: string) => Promise<Buffer>;
  readdir: (path: string) => Promise<string[]>;
  rename: (oldPath: string, newPath: string) => Promise<boolean>;
  rmdir: (path: string) => Promise<boolean>;
  stat: (path: string) => Promise<Stats>;
  unlink: (path: string) => Promise<boolean>;
  writeFile: (
    path: string,
    data: Buffer | string,
    overwrite?: boolean
  ) => Promise<boolean>;
};

const useAsyncFs = (fs?: FSModule): AsyncFSModule =>
  useMemo(
    () => ({
      exists: (path) => new Promise((resolve) => fs?.exists(path, resolve)),
      mkdir: (path, overwrite = false) =>
        new Promise((resolve, reject) =>
          fs?.mkdir(path, { flag: overwrite ? "w" : "wx" }, (error) =>
            error ? reject(error) : resolve(true)
          )
        ),
      readFile: (path) =>
        new Promise((resolve, reject) =>
          fs?.readFile(path, (error, data = EMPTY_BUFFER) =>
            error ? reject(error) : resolve(data)
          )
        ),
      readdir: (path) =>
        new Promise((resolve, reject) =>
          fs?.readdir(path, (error, data = []) =>
            error ? reject(error) : resolve(data)
          )
        ),
      rename: (oldPath, newPath) =>
        new Promise((resolve, reject) =>
          fs?.rename(oldPath, newPath, (error) =>
            error ? reject(error) : resolve(true)
          )
        ),
      rmdir: (path) =>
        new Promise((resolve, reject) =>
          fs?.rmdir(path, (error) => (error ? reject(error) : resolve(true)))
        ),
      stat: (path) =>
        new Promise((resolve, reject) =>
          fs?.stat(path, (error, stats = {} as Stats) =>
            error ? reject(error) : resolve(stats)
          )
        ),
      unlink: (path) =>
        new Promise((resolve, reject) =>
          fs?.unlink(path, (error) => (error ? reject(error) : resolve(true)))
        ),
      writeFile: (path, data, overwrite = false) =>
        new Promise((resolve, reject) =>
          fs?.writeFile(path, data, { flag: overwrite ? "w" : "wx" }, (error) =>
            error ? reject(error) : resolve(true)
          )
        ),
    }),
    [fs]
  );

export default useAsyncFs;
