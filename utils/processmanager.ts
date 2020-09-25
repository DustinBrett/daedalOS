import type { Process } from '@/utils/process';
import type {
  Processes,
  ProcessAction,
  ProcessState,
  ProcessStartPosition
} from '@/types/utils/processmanager';

const addProcess = (
  process: Process,
  processes: Processes,
  previousState: ProcessState = {},
  startPosition: ProcessStartPosition = {}
): Processes => [
  ...processes,
  { ...process, ...previousState, ...startPosition }
];

const removeProcess = (id: string, processes: Processes): Processes =>
  processes.filter((process) => process.id !== id);

const updateProcess = (
  id: string,
  updates: ProcessState,
  processes: Processes
): Processes =>
  processes.map((process) =>
    process.id === id ? { ...process, ...updates } : process
  );

export const processReducer = (
  processes: Processes,
  { id, process, updates, previousState, startPosition }: ProcessAction
): Processes => {
  if (id && updates) return updateProcess(id, updates, processes);
  if (process)
    return addProcess(process, processes, previousState, startPosition);
  if (id) return removeProcess(id, processes);
  return processes;
};

export const getProcessId = (name: string): string =>
  name.toLowerCase().replace(/ /g, '_');
