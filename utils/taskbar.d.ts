import type { ProcessContextType } from '@/contexts/ProcessManager.d';
import type { SessionContextType } from '@/contexts/SessionManager.d';
import type { SessionState } from '@/contexts/SessionManager.d';
import { Process } from '@/utils/pm';

export type WindowStateCycler = Partial<ProcessContextType> &
  Partial<SessionContextType> &
  Partial<SessionState> &
  Partial<Process> & {
    id: string;
  };
