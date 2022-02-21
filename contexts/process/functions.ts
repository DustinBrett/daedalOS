import processDirectory from "contexts/process/directory";
import type {
  Process,
  ProcessArguments,
  ProcessElements,
  Processes,
} from "contexts/process/types";
import { PREVENT_SCROLL, PROCESS_DELIMITER } from "utils/constants";

const setProcessSettings =
  (processId: string, settings: Partial<Process>) =>
  (currentProcesses: Processes): Processes => {
    const { ...newProcesses } = currentProcesses;

    newProcesses[processId] = {
      ...newProcesses[processId],
      ...settings,
    };

    return newProcesses;
  };

export const closeProcess =
  (processId: string, closing?: boolean) =>
  (currentProcesses: Processes): Processes => {
    if (closing) {
      return setProcessSettings(processId, { closing })(currentProcesses);
    }

    const { [processId]: _closedProcess, ...remainingProcesses } =
      currentProcesses;

    return remainingProcesses;
  };

export const createPid = (
  processId: string,
  url: string,
  currentProcesses: Processes
): string => {
  const pid = url ? `${processId}${PROCESS_DELIMITER}${url}` : processId;
  const uniquePid = (instance = 0): string => {
    const newPid = `${pid}${instance ? `${PROCESS_DELIMITER}${instance}` : ""}`;

    return currentProcesses[newPid] ? uniquePid(instance + 1) : newPid;
  };

  return uniquePid();
};

export const openProcess =
  (processId: string, processArguments: ProcessArguments, icon?: string) =>
  (currentProcesses: Processes): Processes => {
    const { url = "" } = processArguments;
    const { singleton } = processDirectory[processId] || {};
    if (singleton && currentProcesses[processId]) {
      return setProcessSettings(processId, { url })(currentProcesses);
    }

    const id = singleton
      ? processId
      : createPid(processId, url, currentProcesses);

    if (currentProcesses[id]) {
      const { componentWindow } = currentProcesses[id];

      componentWindow?.focus(PREVENT_SCROLL);

      return currentProcesses;
    }

    return !processDirectory[processId]
      ? currentProcesses
      : {
          ...currentProcesses,
          [id]: {
            ...processDirectory[processId],
            ...(typeof icon === "string" && { icon }),
            ...processArguments,
          },
        };
  };

export const maximizeProcess =
  (processId: string) =>
  (currentProcesses: Processes): Processes =>
    setProcessSettings(processId, {
      maximized: !currentProcesses[processId]?.maximized,
    })(currentProcesses);

export const minimizeProcess =
  (processId: string) =>
  (currentProcesses: Processes): Processes =>
    setProcessSettings(processId, {
      minimized: !currentProcesses[processId]?.minimized,
    })(currentProcesses);

export const setIcon =
  (processId: string, icon: string) =>
  (currentProcesses: Processes): Processes =>
    setProcessSettings(processId, { icon })(currentProcesses);

export const setProcessArgument =
  (
    processId: string,
    name: keyof ProcessArguments,
    value: ProcessArguments[keyof ProcessArguments]
  ) =>
  (currentProcesses: Processes): Processes =>
    setProcessSettings(processId, { [name]: value })(currentProcesses);

export const setProcessElement =
  (processId: string, name: keyof ProcessElements, element: HTMLElement) =>
  (currentProcesses: Processes): Processes =>
    setProcessSettings(processId, { [name]: element })(currentProcesses);

export const setTitle =
  (processId: string, title: string) =>
  (currentProcesses: Processes): Processes =>
    setProcessSettings(processId, { title })(currentProcesses);

export const setUrl =
  (processId: string, url: string) =>
  (currentProcesses: Processes): Processes =>
    setProcessSettings(processId, { url })(currentProcesses);
