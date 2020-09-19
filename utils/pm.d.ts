import type { AppLoader } from '@/utils/programs';
import type { Process } from '@/utils/pm';

export type Processes = Array<Process>;

export type ProcessState = Partial<Process>;

export type ProcessAction = {
  id?: string;
  process?: Process;
  updates?: ProcessState;
  previousState?: ProcessState;
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
};
