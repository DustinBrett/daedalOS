import type { FC } from 'react';

export type DirectoryEntry = {
  icon: string;
  kind: string;
  name: string;
  fullName: string;
  path: string;
  size: string;
  url: string;
};

export type DirectoryEntryDoubleClick = {
  path: string;
  url?: string;
  icon?: string;
  name?: string;
};

export type DirectoryView = {
  entries: DirectoryEntry[];
  onDoubleClick: (
    event: React.MouseEvent,
    entryData: DirectoryEntryDoubleClick
  ) => void;
  cwd: string;
};

export type DirectoryType = {
  path: string;
  render: FC<DirectoryView>;
  details?: boolean;
  onChange?: (cwd: string) => void;
};
