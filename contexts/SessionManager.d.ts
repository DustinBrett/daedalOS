import type { ProcessState } from '@/utils/pm.d';

export type SessionState = {
  foregroundId: string;
  states: { [key: string]: ProcessState };
  stackOrder: Array<string>;
};

export type SessionContextType = {
  session: SessionState;
  background: (id: string) => void;
  foreground: (id: string) => void;
  getState: (processSelector: { id?: string; name?: string }) => ProcessState;
  saveState: (id: string, state: ProcessState) => void;
};
