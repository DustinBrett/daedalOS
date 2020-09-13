import index from '@/public/index.json';

import type { FSModule } from 'browserfs/dist/node/core/FS';
import type { FC } from 'react';
import type { ListingObj } from '@/contexts/FileSystem.d';

import { createContext, useEffect, useState } from 'react';
import * as BrowserFS from 'browserfs';

const writableJsonFs = (
  path: string,
  listingUrlOrObj: string | ListingObj
): { [key: string]: BrowserFS.FileSystemConfiguration } => ({
  [path]: {
    fs: 'OverlayFS',
    options: {
      readable: {
        fs: 'XmlHttpRequest',
        options: {
          index: listingUrlOrObj
        }
      },
      writable: {
        fs: 'IndexedDB',
        options: {
          storeName: `browser-fs-cache (${path})`
        }
      }
    }
  }
});

export const FileContext = createContext<FSModule>({} as FSModule);

export const FileProvider: FC = ({ children }) => {
  const [fs, setFs] = useState<FSModule>({} as FSModule);

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
