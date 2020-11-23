import type { AppFile } from '@/types/utils/programs';
import type { Dispatch } from 'react';
import type { RndDragCallback, RndResizeCallback } from 'react-rnd';
import type {
  ProcessAction,
  Processes,
  ProcessState
} from '@/types/utils/processmanager';

import { appLoader } from '@/utils/programs';
import { basename, extname } from 'path';
import { getFileIcon } from '@/utils/file';
import { getProcessId, Process } from '@/utils/process';

const singleInstanceApps = ['dos'];

const addProcess = (
  process: Process,
  processes: Processes,
  previousState: ProcessState = {}
): Processes => [...processes, { ...process, ...previousState }];

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
  { id, process, updates, previousState }: ProcessAction
): Processes => {
  if (id && updates) return updateProcess(id, updates, processes);
  if (process) return addProcess(process, processes, previousState);
  if (id) return removeProcess(id, processes);
  return processes;
};

export const close = (updateProcesses: Dispatch<ProcessAction>) => (
  id: string
): void => updateProcesses({ id });

export const maximize = (updateProcesses: Dispatch<ProcessAction>) => (
  id: string
): void => updateProcesses({ updates: { maximized: true }, id });

export const minimize = (updateProcesses: Dispatch<ProcessAction>) => (
  id: string
): void => updateProcesses({ updates: { minimized: true }, id });

export const open = (
  processes: Processes,
  updateProcesses: Dispatch<ProcessAction>
) => (
  appFile: AppFile,
  previousState: ProcessState,
  launchElement: EventTarget
): string => {
  const { appName, icon, name, url } = appFile;
  const existingProcessId = getProcessId(appName || name);
  const singleInstanceApp = singleInstanceApps.includes(existingProcessId);

  if (
    !singleInstanceApp &&
    processes.find(({ id: processId }) => processId === existingProcessId)
  ) {
    if (appName !== name) {
      updateProcesses({ updates: { url }, id: existingProcessId });
    }

    return existingProcessId;
  }

  const loader = appLoader(appFile);

  if (loader) {
    const process = new Process({
      loader,
      icon,
      name: singleInstanceApp ? name : appName || name,
      launchElement,
      ...loader.loaderOptions
    });

    updateProcesses({ process, previousState });

    return process.id;
  }

  return '';
};

export const load = (
  processes: Processes,
  updateProcesses: Dispatch<ProcessAction>
) => (
  file: File,
  previousState: ProcessState,
  launchElement: EventTarget
): Promise<string> => {
  return new Promise((resolve) => {
    const fileReader = new FileReader();

    fileReader.addEventListener('loadend', () => {
      const url = URL.createObjectURL(
        new Blob([new Uint8Array(fileReader.result as ArrayBuffer)])
      );
      const ext = extname(file.name).toLowerCase();

      resolve(
        open(processes, updateProcesses)(
          {
            icon: getFileIcon('', ext),
            name: basename(file.name, ext),
            ext,
            url
          },
          previousState,
          launchElement
        )
      );
    });

    fileReader.readAsArrayBuffer(file);
  });
};

export const position = (updateProcesses: Dispatch<ProcessAction>) => (
  id: string
): RndDragCallback => (_event, { x, y }): void =>
  updateProcesses({ id, updates: { x, y } });

export const restore = (updateProcesses: Dispatch<ProcessAction>) => (
  id: string,
  key: 'minimized' | 'maximized'
): void =>
  updateProcesses({
    updates: { [key]: false },
    id
  });

export const size = (updateProcesses: Dispatch<ProcessAction>) => (
  id: string
): RndResizeCallback => (
  _event,
  _direction,
  { offsetWidth: width, offsetHeight: height },
  _delta,
  { x, y }
): void => updateProcesses({ id, updates: { height, width, x, y } });

export const taskbarElement = (updateProcesses: Dispatch<ProcessAction>) => (
  id: string,
  element: HTMLButtonElement
): void => {
  updateProcesses({ updates: { taskbarElement: element }, id });
};

export const title = (updateProcesses: Dispatch<ProcessAction>) => (
  id: string,
  name = ''
): void => updateProcesses({ updates: { name }, id });
