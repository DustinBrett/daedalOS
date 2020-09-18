import type { ComponentType } from 'react';
import type { RndDragCallback, RndResizeCallback } from 'react-rnd';
import type { ProcessConstructor } from '@/contexts/ProcessManager';
import type { AppFile } from '@/utils/programs.d';

export type AppComponent = {
  args?: Array<string>;
  file?: AppFile;
  zIndex?: number;
  onDoubleClick?: () => void;
  onClose?: () => void;
  onMaximize?: () => void;
  onMinimize?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  updatePosition?: RndDragCallback;
  updateSize?: RndResizeCallback;
};

export type AppLoader = {
  loader: FC<AppComponent> | ComponentType<AppComponent>;
  loaderOptions?: Partial<ProcessConstructor>;
  loadedAppOptions?: Partial<AppComponent>;
};

export type AppFile = {
  icon: string;
  name: string;
  url: string;
  ext?: string;
};
