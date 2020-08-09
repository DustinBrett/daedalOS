import type { Process } from '@/utils/process';

export type Processes = Process[];

export type ProcessState = Partial<Process>;

export type ProcessStartPosition = {
  startX?: number;
  startY?: number;
};

export type ProcessAction = {
  id?: string;
  process?: Process;
  updates?: ProcessState;
  previousState?: ProcessState;
  startPosition?: ProcessStartPosition;
};
