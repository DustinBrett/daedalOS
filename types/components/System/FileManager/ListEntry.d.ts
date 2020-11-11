export type ListEntryProps = {
  path?: string;
  name?: string;
  icon?: string;
  fullName?: string;
  size?: string;
  kind?: string;
  selected: string;
  setSelected: (selected: string) => void;
  doubleClick: (event: React.MouseEvent<Element>) => void;
};
