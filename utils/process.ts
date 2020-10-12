import type { ProcessConstructor } from '@/types/utils/process';

export const getProcessId = (name: string): string =>
  name.toLowerCase().replace(/ /g, '_');

export class Process {
  loader;
  icon;
  name;

  bgColor;
  height;
  id;
  lockAspectRatio;
  width;
  windowed;

  maximized = false;
  minimized = false;

  x;
  y;
  startX;
  startY;
  taskbarElement;

  constructor({
    loader,
    icon,
    name,

    bgColor = '#fff',
    height = 0,
    id = getProcessId(name),
    lockAspectRatio = false,
    width = 0,
    windowed = true,
    x = 0,
    y = 0,
    startX = 0,
    startY = 0,
    taskbarElement
  }: ProcessConstructor) {
    this.loader = loader;
    this.icon = icon;
    this.name = name;
    this.bgColor = bgColor;
    this.height = height;
    this.id = id;
    this.lockAspectRatio = lockAspectRatio;
    this.width = width;
    this.windowed = windowed;
    this.x = x;
    this.y = y;
    this.startX = startX;
    this.startY = startY;
    this.taskbarElement = taskbarElement;
  }
}
