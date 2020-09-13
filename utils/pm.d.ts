import type { Process } from '@/contexts/ProcessManager';

export type Processes = Array<Process>;

export type ProcessAction = {
  id?: string;
  process?: Process;
  updates?: Partial<Process>;
};
