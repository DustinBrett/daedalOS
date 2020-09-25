import type { ProcessState } from '@/types/utils/processmanager';

export type SessionState = {
  foregroundId: string;
  states: { [key: string]: ProcessState };
  stackOrder: string[];
};

export type SessionContextType = {
  session: SessionState;
  background: (id: string) => void;
  foreground: (id: string, removeId?: string) => void;
  getState: (processSelector: { id?: string; name?: string }) => ProcessState;
  saveState: (id: string, state: ProcessState) => void;
};
