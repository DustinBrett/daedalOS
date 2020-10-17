export type WindowStateCycler = {
  foregroundId: string;
  id: string;
  minimized: boolean;
  foreground: (id: string) => void;
  minimize: (id: string) => void;
  restore: (id: string, key: 'minimized' | 'maximized') => void;
};
