import type { ComponentType } from 'react';
import type { RndDragCallback, RndResizeCallback } from 'react-rnd';
import type {
  ProcessConstructor,
  ProcessState
} from '@/types/utils/ProcessManager';

export type AppFile = {
  icon: string;
  name: string;
  url: string;
  ext?: string;
};

export type AppOptions = {
  args?: string[];
  file: AppFile;
};

export type AppWindow = {
  zIndex: number;
  onClose: () => void;
  onMaximize: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  onBlur: () => void;
  updatePosition: RndDragCallback;
  updateSize?: RndResizeCallback;
};

export type AppComponent = AppWindow & Partial<AppOptions> & ProcessState;

export type AppLoader = {
  loader: ComponentType<AppComponent>;
  loaderOptions: Partial<ProcessConstructor>;
  loadedAppOptions?: AppOptions;
};

export type AppLoaders = { [key: string]: AppLoader };
