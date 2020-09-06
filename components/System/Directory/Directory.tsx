import type { FC } from 'react';

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
  onDoubleClick: (path: string, icon?: string, name?: string) => () => void;
};

export const Directory: FC<{
  path: string;
  view: View;
}> = ({ path, view }) => {
  const [cwd, cd] = useState(path),
    [entries, setEntries] = useState([] as Array<DirectoryEntry>),
    fs = useContext(FilesContext), // TODO: Get path working
    { open } = useContext(AppsContext),
    onDoubleClick = (url: string, icon?: string, name?: string) => () => {
      if (url === '..') {
        // cd(resolve(cwd, '..'))
      } else {
        // isDirectory ? cd(path || '') : console.log('TODO: OPEN FILE')
        open?.(url, icon || '', name || '');
      }
    };

  useEffect(() => {
    getDirectory(fs, cwd, (entries) => {
      setEntries(entries);
    });
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
