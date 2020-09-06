import { FC } from 'react';

import { resolve } from 'path';
import { useContext, useEffect, useState } from 'react';
import { DirectoryIcons } from '@/components/System/Directory/DirectoryIcons';
import { DirectoryList } from '@/components/System/Directory/DirectoryList';
import { getDirectory } from '@/utils/files';
import { FilesContext } from '@/contexts/Files';
import { AppsContext } from '@/contexts/Apps';

export enum View {
  Icons,
  List
}

export type DirectoryEntry = {
  icon: string;
  kind: string;
  mtime: string;
  name: string;
  fullName: string;
  path: string;
  size: string;
  url: string;
};

export type DirectoryView = {
  entries: Array<DirectoryEntry>;
  cwd?: string;
  // TODO: Generic type data? Shortcut?
  onDoubleClick: (
    path?: string,
    url?: string,
    icon?: string,
    name?: string
  ) => () => void;
};

export const Directory: FC<{
  path: string;
  view: View;
}> = ({ path, view }) => {
  const [cwd, cd] = useState(path),
    [entries, setEntries] = useState<Array<DirectoryEntry>>([]),
    fs = useContext(FilesContext), // TODO: Get path working
    { open } = useContext(AppsContext),
    onDoubleClick = (path?: string, url = '', icon = '', name = '') => () => {
      if (url) {
        // TODO: isDirectory
        open?.(url, icon, name);
      } else if (path) {
        // TODO: If path is file and not `.url`, then try and open it appLoaderByFileType (Pass loader directly to appOpen)
        cd(path === '..' ? resolve(cwd, '..') : path);
      }
    };

  useEffect(() => {
    getDirectory(fs, cwd, view === View.List, setEntries);
  }, [fs, cwd]);

  switch (view) {
    case View.Icons:
      return <DirectoryIcons entries={entries} onDoubleClick={onDoubleClick} />;
    case View.List:
      return (
        <DirectoryList
          entries={entries}
          onDoubleClick={onDoubleClick}
          cwd={cwd}
        />
      );
    default:
      return <p>Unknown View Type</p>;
  }
};
