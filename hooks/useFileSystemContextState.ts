import { BFSRequire, configure } from 'browserfs';
import type { FSModule } from 'browserfs/dist/node/core/FS';
import { useEffect, useState } from 'react';
import FileSystemConfig from 'utils/FileSystemConfig';

export type FileSystemContextState = {
  fs: FSModule | null;
};

const useFileSystemContextState = (): FileSystemContextState => {
  const [fs, setFs] = useState<FSModule | null>(null);

  useEffect(() => {
    if (!fs) {
      configure(FileSystemConfig, () => setFs(BFSRequire('fs')));
    }
  }, [fs]);

  return { fs };
};

export default useFileSystemContextState;
