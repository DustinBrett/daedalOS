import type { AppLoader } from '@/types/utils/programs';
import type { Process } from '@/utils/processmanager';

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

export type ProcessConstructor = {
  loader: AppLoader;
  icon: string;
  name: string;
  startIndex: number;

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
};
