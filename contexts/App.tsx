import type { FC } from 'react';

export default class {
  component;
  icon;
  id;
  name;

  running = false;
  maximized = false;
  minimized = false;
  active = false; // TODO: Sort Window apps by this <Windows />
  selected = false;

  constructor(component: FC, icon: JSX.Element, id: string, name: string) {
    this.component = component;
    this.icon = icon;
    this.id = id;
    this.name = name;
  }

  open?(): void {
    this.running = true;
    this.active = true;
  }

  // close?(): void {
  //   this.running = false;
  //   this.minimized = false;
  //   this.maximized = false;
  // }

  // setMaximize?(maximize: boolean): void {
  //   this.maximized = maximize;
  // }

  setMinimized?(minimize: boolean): void {
    this.minimized = minimize;
  }

  // setActive?(active: boolean): void {
  //   this.active = active;
  // }

  // setSelected?(selected: boolean): void {
  //   this.selected = selected;
  // }
}
