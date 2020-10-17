import type { AppLoader } from '@/types/utils/programs';

export type ProcessConstructor = {
  loader: AppLoader;
  icon: string;
  name: string;
  launchElement: EventTarget;

  bgColor?: string;
  height?: number;
  id?: string;
  lockAspectRatio?: boolean;
  width?: number;
  windowed?: boolean;
  x?: number;
  y?: number;
  taskbarElement?: HTMLButtonElement;
};
