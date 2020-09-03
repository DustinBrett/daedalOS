import type { FSModule } from 'browserfs/dist/node/core/FS';
import type { FC } from 'react';

import { createContext, useEffect, useState } from 'react';
import * as BrowserFS from 'browserfs';

const fsConfig = {
  fs: 'MountableFileSystem',
  options: {
    '/': {
      fs: 'OverlayFS',
      options: {
        readable: {
          fs: 'XmlHttpRequest',
          options: {}
        },
        writable: {
          fs: 'LocalStorage'
        }
      }
    }
  }
};

export const FilesContext = createContext<Partial<FSModule>>({});

export const FilesProvider: FC = ({ children }) => {
  const [fs, setFS] = useState<Partial<FSModule>>({});

  useEffect(() => {
    BrowserFS.install(window);

    BrowserFS.configure(fsConfig, () => {
      setFS(BrowserFS.BFSRequire('fs'));
    });
  }, []);

  return <FilesContext.Provider value={fs}>{children}</FilesContext.Provider>;
};
