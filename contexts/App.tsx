import type { FC } from 'react';

export default class {
  component;
  icon;
  id;
  name;
  withWindow;

  running = false;
  maximized = false;
  minimized = false;
  foreground = false;

  constructor(
    component: FC,
    icon: string,
    id: string,
    name: string,
    withWindow = true
  ) {
    this.component = component;
    this.icon = icon;
    this.id = id;
    this.name = name;
    this.withWindow = withWindow;
  }
}
