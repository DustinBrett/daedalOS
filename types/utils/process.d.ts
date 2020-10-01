import type { AppLoader } from '@/types/utils/programs';

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
