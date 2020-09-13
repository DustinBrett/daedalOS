import type { AppLoader } from '@/utils/apps.d';
import type { Process } from '@/utils/pm';

export type Processes = Array<Process>;

export type ProcessAction = {
  id?: string;
  process?: Process;
  updates?: Partial<Process>;
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
