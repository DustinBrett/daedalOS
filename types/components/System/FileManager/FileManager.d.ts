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
  cwd: string;
  entries: DirectoryEntry[];
  onDoubleClick: (
    entryData: DirectoryEntryDoubleClick
  ) => (event: React.MouseEvent) => void;
};

export type DirectoryType = {
  path: string;
  render: React.FC<DirectoryView>;
  details?: boolean;
  onChange?: (cwd?: string) => void;
};
