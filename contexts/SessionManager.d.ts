import type { ProcessState } from '@/utils/pm.d';

export type SessionState = {
  foregroundId?: string;
  states?: { [key: string]: ProcessState };
  stackOrder?: Array<string>;
};

export type SessionContextType = {
  session: SessionState;
  background?: (id?: string) => void;
  foreground: (id: string) => void;
  getState: (id: string) => ProcessState;
  saveState?: (id: string, state: ProcessState) => void;
};
