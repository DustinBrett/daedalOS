import type { FC } from 'react';

import { useContext, useEffect, useState } from 'react';
import { getDirectory, hasExtension } from '@/utils/files';
import { FilesContext } from '@/contexts/Files';
import { AppsContext } from '@/contexts/Apps';
import { resolve } from 'path';
import dynamic from 'next/dynamic';

export enum View {
  Icons,
  List
}

export type DirectoryEntry = {
  icon: string;
  kind: string;
  name: string;
  fullName: string;
  path: string;
  size: string;
  url: string;
};

export type DirectoryView = {
  entries: Array<DirectoryEntry>;
  cwd?: string;
  onDoubleClick: (
    path?: string,
    url?: string,
    icon?: string,
    name?: string
  ) => () => void;
};

const DirectoryIcons = dynamic(
  import('@/components/System/Directory/DirectoryIcons')
);
const DirectoryList = dynamic(
  import('@/components/System/Directory/DirectoryList')
);

export const Directory: FC<{
  path: string;
  view?: View;
}> = ({ path, view = View.Icons }) => {
  const [cwd, cd] = useState(path),
    [entries, setEntries] = useState<Array<DirectoryEntry>>([]),
    fs = useContext(FilesContext),
    { apps, open, focus } = useContext(AppsContext),
    onDoubleClick = (
      path?: string,
      url?: string,
      icon = '',
      name = ''
    ) => () => {
      if (
        path &&
        !path.includes('.url') &&
        (path === '..' || hasExtension(path))
      ) {
        cd(path === '..' ? resolve(cwd, '..') : path);
      } else {
        const { id } = apps.find(({ name: appName }) => appName === name) || {};

        if (!id) {
          open?.(url || path || '', icon, name);
        } else {
          focus?.(id);
        }
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

export default Directory;
