import { BFSRequire, configure, FileSystem } from 'browserfs';
import type IsoFS from 'browserfs/dist/node/backend/IsoFS';
import type MountableFileSystem from 'browserfs/dist/node/backend/MountableFileSystem';
import type ZipFS from 'browserfs/dist/node/backend/ZipFS';
import type { BFSCallback } from 'browserfs/dist/node/core/file_system';
import type { FSModule } from 'browserfs/dist/node/core/FS';
import FileSystemConfig from 'contexts/fileSystem/FileSystemConfig';
import { extname } from 'path';
import { useCallback, useEffect, useMemo, useState } from 'react';

export type FileSystemContextState = {
  fs: FSModule | null;
  mountFs: (url: string, callback: () => void) => void;
  unMountFs: (url: string) => void;
};

const useFileSystemContextState = (): FileSystemContextState => {
  const [fs, setFs] = useState<FSModule | null>(null);
  const rootFs = useMemo(() => fs?.getRootFS() as MountableFileSystem, [fs]);
  const mountFs = useCallback(
    (url: string, callback: () => void): void =>
      fs?.readFile(url, (_readError, fileData = Buffer.from('')) => {
        const isISO = extname(url) === '.iso';
        const createFs: BFSCallback<IsoFS | ZipFS> = (_createError, newFs) => {
          if (newFs) {
            rootFs?.mount(url, newFs);
            callback();
          }
        };

        if (isISO) {
          FileSystem.IsoFS.Create({ data: fileData }, createFs);
        } else {
          FileSystem.ZipFS.Create({ zipData: fileData }, createFs);
        }
      }),
    [fs, rootFs]
  );
  const unMountFs = useCallback(
    (url: string): void => rootFs?.umount(url),
    [rootFs]
  );

  useEffect(() => {
    if (!fs) {
      configure(FileSystemConfig, () => setFs(BFSRequire('fs')));
    }
  }, [fs]);

  return { fs, mountFs, unMountFs };
};

export default useFileSystemContextState;
