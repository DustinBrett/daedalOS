import index from '@/public/index.json';

import type { FSModule } from 'browserfs/dist/node/core/FS';

import { createContext, useEffect, useState } from 'react';
import * as BrowserFS from 'browserfs';
import { writableJsonFs } from '@/utils/filesystem';

export const FileContext = createContext<FSModule>({} as FSModule);

const FileProvider: React.FC = ({ children }) => {
  const [fs, setFs] = useState<FSModule>({} as FSModule); // TODO: Add BFS Path

  useEffect(() => {
    BrowserFS.install(window);

    BrowserFS.configure(
      {
        fs: 'MountableFileSystem',
        options: {
          ...writableJsonFs('/', index)
        }
      },
      () => {
        setFs(BrowserFS.BFSRequire('fs'));
      }
    );
  }, []);

  return <FileContext.Provider value={fs}>{children}</FileContext.Provider>;
};

export default FileProvider;
