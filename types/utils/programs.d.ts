import type { ComponentType } from 'react';
import type { ProcessConstructor } from '@/types/utils/process';
import type { ProcessState } from '@/types/utils/processmanager';
import type { RndDragCallback, RndResizeCallback } from 'react-rnd';

export type AppFile = {
  icon: string;
  name: string;
  url: string;
  appName?: string;
  ext?: string;
};

export type AppOptions = {
  args?: URLSearchParams;
  file: AppFile;
};

export type AppWindow = {
  zIndex: number;
  onClose: () => void;
  onMaximize: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  onBlur: (event: React.FocusEvent) => void;
  onDrag: RndDragCallback;
  onResize?: RndResizeCallback;
};

export type AppComponent = AppWindow & Partial<AppOptions> & ProcessState;

export type AppLoader = {
  loader: ComponentType<AppComponent>;
  loaderOptions: Partial<ProcessConstructor>;
  loadedAppOptions?: AppOptions;
};

export type AppLoaders = { [key: string]: AppLoader };
