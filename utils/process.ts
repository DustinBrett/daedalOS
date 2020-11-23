import type { ProcessConstructor } from '@/types/utils/process';

export const getProcessId = (name: string): string =>
  name.toLowerCase().replace(/ /g, '_');

export class Process {
  loader;

  icon;

  name;

  launchElement;

  bgColor;

  height;

  id;

  lockAspectRatio;

  width;

  windowed;

  maximized = false;

  minimized = false;

  url = '';

  x;

  y;

  taskbarElement;

  constructor({
    loader,
    icon,
    name,
    launchElement,

    bgColor = '#fff',
    height = 0,
    id = getProcessId(name),
    lockAspectRatio = false,
    width = 0,
    windowed = true,
    x = 0,
    y = 0,
    taskbarElement
  }: ProcessConstructor) {
    this.loader = loader;
    this.icon = icon;
    this.name = name;
    this.launchElement = launchElement as HTMLElement;
    this.bgColor = bgColor;
    this.height = height;
    this.id = id;
    this.lockAspectRatio = lockAspectRatio;
    this.width = width;
    this.windowed = windowed;
    this.x = x;
    this.y = y;
    this.taskbarElement = taskbarElement;
  }
}
