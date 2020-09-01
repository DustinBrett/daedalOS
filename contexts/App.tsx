import type { FC } from 'react';
import type { RndDragCallback, RndResizeCallback } from 'react-rnd';

export type AppComponent = {
  onDoubleClick?: () => void;
  onClose?: () => void;
  onMinimize?: () => void;
  onFocus?: () => void;
  updatePosition?: RndDragCallback;
  updateSize?: RndResizeCallback;
  tabIndex?: number;
  zIndex?: number;
};

export type AppConstructor = {
  component: FC<AppComponent>;
  icon: string;
  name: string;

  height?: number;
  width?: number;
  x?: number;
  y?: number;

  id?: string;
  windowed?: boolean;
  lockAspectRatio?: boolean;
  hideScrollbars?: boolean;
};

export default class {
  component;
  icon;
  name;

  height;
  width;
  x;
  y;

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

    height = 0,
    width = 0,
    x = 0,
    y = 0,

    id = name.toLowerCase().replace(/ /g, '_'),
    windowed = true,
    lockAspectRatio = false,
    hideScrollbars = false
  }: AppConstructor) {
    // TODO: Can I do const this = { component };
    this.component = component;
    this.icon = icon;
    this.name = name;
    this.id = id;
    this.height = height;
    this.width = width;
    this.x = x;
    this.y = y;
    this.windowed = windowed;
    this.lockAspectRatio = lockAspectRatio;
    this.hideScrollbars = hideScrollbars;
  }
}
