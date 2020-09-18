import type {
  Processes,
  ProcessAction,
  ProcessConstructor
} from '@/utils/pm.d';

// TODO: Replace with SessionContext
export const sessionProcessState: { [key: string]: Partial<Process> } = {};

const addProcess = (process: Process, processes: Processes): Processes => [
  ...processes,
  { ...process, ...(sessionProcessState[process.id] || {}) }
];

const removeProcess = (id: string, processes: Processes): Processes => {
  return processes.filter((process) => {
    if (process.id !== id) return true;

    const { height, width, x, y } = process,
      { x: previousX = 0, y: previousY = 0 } = sessionProcessState[id] || {};
    sessionProcessState[id] = {
      height,
      width,
      x: previousX === x ? x : previousX + x,
      y: previousY === y ? y : previousY + y
    };
  });
};

const updateProcess = (
  id: string,
  updates: Partial<Process>,
  processes: Processes
): Processes =>
  processes.map((process) =>
    process.id === id ? { ...process, ...updates } : process
  );

export const processReducer = (
  processes: Processes,
  { id, process, updates }: ProcessAction
): Processes => {
  if (id && updates) return updateProcess(id, updates, processes);
  if (process) return addProcess(process, processes);
  if (id) return removeProcess(id, processes);
  return processes;
};

export class Process {
  loader;
  icon;
  name;

  bgColor;
  height;
  hideScrollbars;
  id;
  lockAspectRatio;
  width;
  windowed;

  maximized = false;
  minimized = false;

  x;
  y;

  constructor({
    loader,
    icon,
    name,

    bgColor = '#fff',
    height = 0,
    hideScrollbars = false,
    id = name.toLowerCase().replace(/ /g, '_'),
    lockAspectRatio = false,
    width = 0,
    windowed = true,
    x = 0,
    y = 0
  }: ProcessConstructor) {
    this.loader = loader;
    this.icon = icon;
    this.name = name;
    this.bgColor = bgColor;
    this.height = height;
    this.hideScrollbars = hideScrollbars;
    this.id = id;
    this.lockAspectRatio = lockAspectRatio;
    this.width = width;
    this.windowed = windowed;
    this.x = x;
    this.y = y;
  }
}
