import type { SessionState } from '@/contexts/SessionManager.d';

export type WindowStateCycler = {
  id: string;
  session: SessionState;
  minimized: boolean;
  background?: (id: string) => void;
  foreground?: (id: string) => void;
  minimize?: (id: string) => void;
  restore?: (id: string) => void;
};
