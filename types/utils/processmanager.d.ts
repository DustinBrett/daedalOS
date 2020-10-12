import type { Process } from '@/utils/process';

export type Processes = Process[];

export type ProcessState = Partial<Process>;

export type ProcessAction = {
  id?: string;
  process?: Process;
  updates?: ProcessState;
  previousState?: ProcessState;
};
