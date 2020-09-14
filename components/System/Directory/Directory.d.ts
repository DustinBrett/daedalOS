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
  onDoubleClick: (
    path?: string,
    url?: string,
    icon?: string,
    name?: string
  ) => () => void;
  cwd?: string;
};
