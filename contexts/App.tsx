import type { FC } from 'react';

export default class {
  component;
  icon;
  id;
  name;

  running = false;
  maximized = false;
  minimized = false;
  active = false;
  selected = false;

  constructor(component: FC, icon: JSX.Element, id: string, name: string) {
    this.component = component;
    this.icon = icon;
    this.id = id;
    this.name = name;
  }
}
