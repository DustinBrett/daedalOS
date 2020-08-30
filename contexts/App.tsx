import type { FC } from 'react';

export type AppComponent = {
  onClose?: () => void;
  onMinimize?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  zIndex?: number;
};

export type AppConstructor = {
  component: FC<AppComponent>;
  icon: string;
  name: string;

  id?: string;
  windowed?: boolean;
  lockAspectRatio?: boolean;
  hideScrollbars?: boolean;
};

// TODO: Keep track of index by app count + 1 for foreground
// TODO: Keep track of x, y, height, width
// TODO: Cascading windows (Based on index)

export default class {
  component;
  icon;
  name;
  id;
  windowed;
  lockAspectRatio;
  hideScrollbars;

  running = false;
  foreground = false;
  maximized = false;
  minimized = false;

  // index = 0;
  // x = 0;
  // y = 0;
  // height = 0;
  // width = 0;

  constructor({
    component,
    icon,
    name,
    id = name.toLowerCase().replace(/ /g, '_'),
    windowed = true,
    lockAspectRatio = false,
    hideScrollbars = false
  }: AppConstructor) {
    this.component = component;
    this.icon = icon;
    this.name = name;
    this.id = id;
    this.windowed = windowed;
    this.lockAspectRatio = lockAspectRatio;
    this.hideScrollbars = hideScrollbars;
  }
}
