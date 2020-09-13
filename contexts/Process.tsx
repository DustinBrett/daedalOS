import type { FC } from 'react';
import type { Processes, ProcessAction, ProcessConstructor, ProcessContextType } from '@/contexts/Process.d';

import { createContext, useReducer } from 'react';
import {
  close,
  focus,
  maximize,
  minimize,
  open,
  position,
  size,
  title
} from '@/utils/process';

// TODO: Move this to a Session context
// Use with stackorder and selected icon/window
const sessionProcessState: { [key: string]: Partial<Process> } = {};

const updateProcess = (id: string, updates: Partial<Process>, processes: Processes): Processes =>
  processes.map((process) => process.id === id ? { ...process, ...updates } : process);

const addProcess = (process: Process, processes: Processes): Processes =>
  [...processes, { ...process, ...(sessionProcessState[process.id] || {}) }];

const removeProcess = (id: string, processes: Processes): Processes => {
  return processes.filter((process) => {
    if (process.id !== id) return true;

    const { height, width, x, y } = process;
    sessionProcessState[id] = { height, width, x, y };
  });
};

const processReducer = (processes: Processes, { id, process, updates }: ProcessAction) => {
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
  x;
  y;

  foreground = false;
  maximized = false;
  minimized = false;
  stackOrder: Array<string> = [];

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

export const ProcessContext = createContext<ProcessContextType>({
  processes: []
});

export const ProcessProvider: FC = ({ children }) => {
  const [processes, updateProcesses] = useReducer(processReducer, []);

  return (
    <ProcessContext.Provider
      value={{
        processes,
        close: close(processes, updateProcesses),
        focus: focus(processes, updateProcesses),
        maximize: maximize(updateProcesses),
        minimize: minimize(updateProcesses),
        open: open(updateProcesses),
        position: position(updateProcesses),
        size: size(updateProcesses),
        title: title(updateProcesses)
      }}
    >
      {children}
    </ProcessContext.Provider>
  );
};

export default ProcessProvider;
