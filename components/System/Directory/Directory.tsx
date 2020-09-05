import type { FC } from 'react';

import { useContext, useEffect, useState } from 'react';
import { DirectoryIcons } from '@/components/System/Directory/DirectoryIcons';
import { DirectoryList } from '@/components/System/Directory/DirectoryList';
import { getDirectory } from '@/utils/files';
import { FilesContext } from '@/contexts/Files';

export enum View {
  Icons,
  List
}

export type DirectoryEntry = {
  id?: string;
  icon: string;
  name: string;

  path?: string;
  mtime?: Date;
  formattedModifiedTime?: string;
  size?: number;
  formattedSize?: string;
  isDirectory?: boolean;
  kind?: string;

  onDoubleClick?: () => void;
};

export type DirectoryView = {
  entries: Array<DirectoryEntry>;

  cd?: (dir: string) => void;
  cwd?: string;
};

export const Directory: FC<{
  path: string;
  view: View;
}> = ({ path, view }) => {
  const [cwd, cd] = useState(path),
    [entries, setEntries] = useState([] as Array<DirectoryEntry>),
    fs = useContext(FilesContext);

  useEffect(() => {
    console.log(fs, cwd);
    getDirectory(fs, cwd, (entries) => {
      setEntries(entries);
    });
  }, [fs, cwd]);

  switch (view) {
    case View.Icons:
      return <DirectoryIcons entries={entries} />;
    case View.List:
      return <DirectoryList entries={entries} cwd={cwd} cd={cd} />;
    default:
      return <p>Unknown View Type</p>;
  }
};
