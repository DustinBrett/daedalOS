import type { FC } from 'react';

export type AppComponent = {
  onDoubleClick?: () => void;
  onClose?: () => void;
  onMinimize?: () => void;
  onFocus?: () => void;
  updatePosition?: () => void;
  updateSize?: () => void;
  tabIndex?: number;
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
  lastRunning: Date = new Date(0);
  stackOrder: Array<string> = [];

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
