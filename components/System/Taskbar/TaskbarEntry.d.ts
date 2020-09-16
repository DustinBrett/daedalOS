export type TaskbarEntryType = {
  icon: string;
  id: string;
  name: string;
  onBlur: () => void;
  onClick: () => void;
};
