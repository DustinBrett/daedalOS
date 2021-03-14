import type { Processes } from 'utils/processDirectory';
import processDirectory from 'utils/processDirectory';

export const closeProcess = (processId: string) => ({
  [processId]: _closedProcess,
  ...remainingProcesses
}: Processes): Processes => remainingProcesses;

export const openProcess = (processId: string) => (
  currentProcesses: Processes
): Processes =>
  currentProcesses[processId] || !processDirectory[processId]
    ? currentProcesses
    : {
        ...currentProcesses,
        [processId]: processDirectory[processId]
      };

export const toggleProcessSetting = (
  processId: string,
  setting: 'maximized' | 'minimized'
) => ({ [processId]: process, ...otherProcesses }: Processes): Processes =>
  process
    ? {
        [processId]: {
          ...process,
          [setting]: !process[setting]
        },
        ...otherProcesses
      }
    : otherProcesses;

export const maximizeProcess = (processId: string) => (
  processes: Processes
): Processes => toggleProcessSetting(processId, 'maximized')(processes);

export const minimizeProcess = (processId: string) => (
  processes: Processes
): Processes => toggleProcessSetting(processId, 'minimized')(processes);
