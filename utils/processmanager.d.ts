import type { AppLoader } from '@/utils/programs.d';
import type { Process } from '@/utils/processmanager';

export type Processes = Array<Process>;

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

export type ProcessConstructor = {
  loader: AppLoader;
  icon: string;
  name: string;

  bgColor?: string;
  height?: number;
  hideScrollbars?: boolean;
  id?: string;
  lockAspectRatio?: boolean;
  width?: number;
  windowed?: boolean;
  x?: number;
  y?: number;
  startX?: number;
  startY?: number;
  startIndex?: number;
};
