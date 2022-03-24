import type * as IBrowserFS from "browserfs";
import type MountableFileSystem from "browserfs/dist/node/backend/MountableFileSystem";
import type {
  BFSCallback,
  FileSystem,
} from "browserfs/dist/node/core/file_system";
import type { FSModule } from "browserfs/dist/node/core/FS";
import type Stats from "browserfs/dist/node/core/node_fs_stats";
import FileSystemConfig from "contexts/fileSystem/FileSystemConfig";
import { supportsIndexedDB } from "contexts/fileSystem/functions";
import * as BrowserFS from "public/System/BrowserFS/browserfs.min.js";
import { useEffect, useMemo, useState } from "react";

export type AsyncFS = {
  exists: (path: string) => Promise<boolean>;
  mkdir: (path: string, overwrite?: boolean) => Promise<boolean>;
  readFile: (path: string) => Promise<Buffer>;
  readdir: (path: string) => Promise<string[]>;
  rename: (oldPath: string, newPath: string) => Promise<boolean>;
  rmdir: (path: string) => Promise<boolean>;
  stat: (path: string, fromNode?: boolean) => Promise<Stats>;
  unlink: (path: string) => Promise<boolean>;
  writeFile: (
    path: string,
    data: Buffer | string,
    overwrite?: boolean
  ) => Promise<boolean>;
};

type IFileSystemAccess = {
  FileSystem: {
    FileSystemAccess: {
      Create: (
        opts: { handle: FileSystemDirectoryHandle },
        cb: BFSCallback<FileSystem>
      ) => void;
    };
  };
};

const {
  BFSRequire,
  configure,
  FileSystem: { FileSystemAccess, IsoFS, ZipFS },
} = BrowserFS as IFileSystemAccess & typeof IBrowserFS;

export type RootFileSystem = Omit<
  MountableFileSystem,
  "mntMap" | "mountList"
> & {
  mntMap: Record<
    string,
    {
      data: Buffer;
      getName: () => string;
    }
  >;
  mountList: string[];
};

type AsyncFSModule = AsyncFS & {
  fs?: FSModule;
  FileSystemAccess?: typeof FileSystemAccess;
  IsoFS?: typeof IsoFS;
  rootFs?: RootFileSystem;
  ZipFS?: typeof ZipFS;
};

const useAsyncFs = (): AsyncFSModule => {
  const [fs, setFs] = useState<FSModule>();
  const [rootFs, setRootFs] = useState<RootFileSystem>();
  const asyncFs: AsyncFS = useMemo(
    () => ({
      exists: (path) =>
        new Promise((resolve) => {
          fs?.exists(path, resolve);
        }),
      mkdir: (path, overwrite = false) =>
        new Promise((resolve, reject) => {
          fs?.mkdir(path, { flag: overwrite ? "w" : "wx" }, (error) =>
            error ? reject(error) : resolve(true)
          );
        }),
      readFile: (path) =>
        new Promise((resolve, reject) => {
          fs?.readFile(path, (error, data = Buffer.from("")) => {
            if (!error) return resolve(data);

            if (error.code === "EISDIR" && rootFs?.mntMap[path]?.data) {
              return resolve(rootFs.mntMap[path].data);
            }

            return reject(error);
          });
        }),
      readdir: (path) =>
        new Promise((resolve, reject) => {
          fs?.readdir(path, (error, data = []) =>
            error ? reject(error) : resolve(data)
          );
        }),
      rename: (oldPath, newPath) =>
        new Promise((resolve, reject) => {
          fs?.rename(oldPath, newPath, (renameError) => {
            if (!renameError) {
              resolve(true);
            } else if (renameError.code === "ENOTSUP") {
              fs.lstat(oldPath, (_statsError, stats = {} as Stats) => {
                if (stats.isDirectory()) {
                  reject();
                } else {
                  fs.readFile(oldPath, (readError, data) =>
                    fs.writeFile(newPath, data, (writeError) =>
                      readError || writeError
                        ? reject(readError || writeError)
                        : resolve(false)
                    )
                  );
                }
              });
            } else if (renameError.code === "EISDIR") {
              rootFs?.umount(oldPath);
              asyncFs.rename(oldPath, newPath).then(resolve, reject);
            } else {
              reject(renameError);
            }
          });
        }),
      rmdir: (path) =>
        new Promise((resolve, reject) => {
          fs?.rmdir(path, (error) => (error ? reject(error) : resolve(true)));
        }),
      stat: (path, fromNode) =>
        new Promise((resolve, reject) => {
          const stat = fromNode ? fs?.lstat : fs?.stat;
          stat?.(path, (error, stats = {} as Stats) =>
            error ? reject(error) : resolve(stats)
          );
        }),
      unlink: (path) =>
        new Promise((resolve, reject) => {
          fs?.unlink(path, (error) => (error ? reject(error) : resolve(true)));
        }),
      writeFile: (path, data, overwrite = false) =>
        new Promise((resolve, reject) => {
          fs?.writeFile(path, data, { flag: overwrite ? "w" : "wx" }, (error) =>
            error && (!overwrite || error.code !== "EEXIST")
              ? reject(error)
              : resolve(!error)
          );
        }),
    }),
    [fs, rootFs]
  );

  useEffect(() => {
    if (!fs) {
      const setupFs = (writeToIndexedDB: boolean): void =>
        configure(FileSystemConfig(!writeToIndexedDB), () => {
          const loadedFs = BFSRequire("fs");

          setFs(loadedFs);
          setRootFs(loadedFs.getRootFS() as RootFileSystem);
        });

      supportsIndexedDB().then(setupFs);
    }
  }, [fs]);

  return {
    ...asyncFs,
    FileSystemAccess,
    IsoFS,
    ZipFS,
    fs,
    rootFs,
  };
};

export default useAsyncFs;
