import type { Process } from '@/contexts/ProcessManager';
import type { Processes, ProcessAction } from '@/utils/pm.d';

const sessionProcessState: { [key: string]: Partial<Process> } = {};

const updateProcess = (
  id: string,
  updates: Partial<Process>,
  processes: Processes
): Processes =>
  processes.map((process) =>
    process.id === id ? { ...process, ...updates } : process
  );

const addProcess = (process: Process, processes: Processes): Processes => [
  ...processes,
  { ...process, ...(sessionProcessState[process.id] || {}) }
];

const removeProcess = (id: string, processes: Processes): Processes => {
  return processes.filter((process) => {
    if (process.id !== id) return true;

    const { height, width, x, y } = process;
    sessionProcessState[id] = { height, width, x, y };
  });
};

export const processReducer = (
  processes: Processes,
  { id, process, updates }: ProcessAction
): Processes => {
  if (id && updates) return updateProcess(id, updates, processes);
  if (process) return addProcess(process, processes);
  if (id) return removeProcess(id, processes);
  return processes;
};
