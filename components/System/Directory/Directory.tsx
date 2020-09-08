import { FC } from 'react';

import { resolve } from 'path';
import { useContext, useEffect, useState } from 'react';
import { DirectoryIcons } from '@/components/System/Directory/DirectoryIcons';
import { DirectoryList } from '@/components/System/Directory/DirectoryList';
import { getDirectory, getFileExtension } from '@/utils/files';
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

// TODO: Use `path` logic from BFS
const isDirectory = (path = '') => {
  return getFileExtension(path) === '';
};

export const Directory: FC<{
  path: string;
  view: View;
}> = ({ path, view }) => {
  const [cwd, cd] = useState(path),
    [entries, setEntries] = useState<Array<DirectoryEntry>>([]),
    fs = useContext(FilesContext), // TODO: Get path working
    { open } = useContext(AppsContext),
    onDoubleClick = (path?: string, url?: string, icon = '', name = '') => () => {
      if (path && !path.includes('.url') &&  (path === '..' || isDirectory(path))) {
        // cd(path === '..' ? resolve(cwd, '..') : path);
        cd(path);
      } else {
        console.log('hi')
        // TODO: Don't allow opening app twice
        open?.(url || path || '', icon, name);
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
