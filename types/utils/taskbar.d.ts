import type { SessionState } from '@/types/contexts/SessionManager';

export type WindowStateCycler = {
  id: string;
  session: SessionState;
  minimized: boolean;
  foreground: (id: string) => void;
  minimize: (id: string) => void;
  restore: (id: string) => void;
};
