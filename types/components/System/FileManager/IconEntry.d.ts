export type IconEntryProps = {
  icon: string;
  name: string;
  kind: string;
  path: string;
  url: string;
  navRef: React.RefObject<HTMLElement>;
  onDoubleClick: (
    entryData: DirectoryEntryDoubleClick
  ) => (event: React.MouseEvent) => void;
};
