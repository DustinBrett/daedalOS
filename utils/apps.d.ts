import { ProcessConstructor } from '@/contexts/Process.d';

export type AppComponent = {
  args?: Array<string>;
  url?: string;
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
