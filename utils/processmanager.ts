import type { Dispatch } from 'react';
import type { RndDragCallback, RndResizeCallback } from 'react-rnd';
import type {
  Processes,
  ProcessAction,
  ProcessState,
  ProcessStartPosition
} from '@/types/utils/processmanager';
import type { AppFile } from '@/types/utils/programs';

import { basename, extname } from 'path';
import { appLoader } from '@/utils/programs';
import { getFileIcon } from '@/utils/file';
import { getProcessId, Process } from '@/utils/process';

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
  startPosition: ProcessStartPosition
): string => {
  const { icon, name } = appFile;
  const existingProcessId = getProcessId(name);

  if (processes.find(({ id: processId }) => processId === existingProcessId))
    return existingProcessId;

  const loader = appLoader(appFile);

  if (loader) {
    const process = new Process({
      loader,
      icon,
      name,
      startIndex: processes.length + 1,
      ...loader.loaderOptions
    });

    updateProcesses({ process, previousState, startPosition });

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
  startPosition: ProcessStartPosition
): void => {
  const fileReader = new FileReader();

  fileReader.addEventListener('loadend', () => {
    const url = URL.createObjectURL(
      new Blob([new Uint8Array(fileReader.result as ArrayBuffer)])
    );
    const ext = extname(file.name).toLowerCase();

    open(processes, updateProcesses)(
      {
        icon: getFileIcon('', ext),
        name: basename(file.name, ext),
        ext,
        url
      },
      previousState,
      startPosition
    );
  });

  fileReader.readAsArrayBuffer(file);
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
  { offsetWidth: width, offsetHeight: height }
): void => updateProcesses({ id, updates: { height, width } });

export const title = (updateProcesses: Dispatch<ProcessAction>) => (
  id: string,
  name = ''
): void => updateProcesses({ updates: { name }, id });
