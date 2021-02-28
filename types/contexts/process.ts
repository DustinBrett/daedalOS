export type Process = {
  Component: React.ComponentType;
  hasWindow?: boolean;
  icon: string;
  title: string;
};

export type Processes = {
  [id: string]: Process;
};

export type ProcessContextState = {
  close: (id: string) => void;
  open: (id: string) => void;
  processes: Processes;
};
