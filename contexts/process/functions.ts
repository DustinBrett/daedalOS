import type {
  Process,
  ProcessElements,
  Processes
} from 'contexts/process/directory';
import processDirectory from 'contexts/process/directory';
import { PROCESS_DELIMITER } from 'utils/constants';

export const setProcessSettings = (
  processId: string,
  settings: Partial<Process>
) => (currentProcesses: Processes): Processes => {
  const { ...newProcesses } = currentProcesses;

  newProcesses[processId] = {
    ...newProcesses[processId],
    ...settings
  };

  return newProcesses;
};

export const closeProcess = (processId: string, closing?: boolean) => (
  currentProcesses: Processes
): Processes => {
  if (closing) {
    return setProcessSettings(processId, { closing })(currentProcesses);
  }

  const {
    [processId]: _closedProcess,
    ...remainingProcesses
  } = currentProcesses;

  return remainingProcesses;
};

export const createPid = (processId: string, url: string): string =>
  url ? `${processId}${PROCESS_DELIMITER}${url}` : processId;

export const openProcess = (processId: string, url: string) => (
  currentProcesses: Processes
): Processes => {
  const id = createPid(processId, url);

  return currentProcesses[id] || !processDirectory[processId]
    ? currentProcesses
    : {
        ...currentProcesses,
        [id]: {
          ...processDirectory[processId],
          url
        }
      };
};

export const maximizeProcess = (processId: string) => (
  currentProcesses: Processes
): Processes =>
  setProcessSettings(processId, {
    maximized: !currentProcesses[processId].maximized
  })(currentProcesses);

export const minimizeProcess = (processId: string) => (
  currentProcesses: Processes
): Processes =>
  setProcessSettings(processId, {
    minimized: !currentProcesses[processId].minimized
  })(currentProcesses);

export const setProcessElement = (
  processId: string,
  name: keyof ProcessElements,
  element: HTMLElement
) => (currentProcesses: Processes): Processes =>
  setProcessSettings(processId, { [name]: element })(currentProcesses);

export const setTitle = (processId: string, title: string) => (
  currentProcesses: Processes
): Processes => setProcessSettings(processId, { title })(currentProcesses);
