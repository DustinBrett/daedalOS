import type { Dispatch } from 'react';
import type { RndDragCallback, RndResizeCallback } from 'react-rnd';
import type {
  Processes,
  ProcessAction,
  ProcessState,
  ProcessStartPosition
} from '@/utils/pm.d';
import type { AppFile } from '@/utils/programs.d';

import { basename, extname } from 'path';
import { getProcessId, Process } from '@/utils/pm';
import { appLoader } from '@/utils/programs';
import { getFileIcon } from '@/utils/file';

export const close = (updateProcesses: Dispatch<ProcessAction>) => (
  id: string,
  [, nextRemainingProcessId = '']: Array<string>
): string => {
  updateProcesses({ id });

  return nextRemainingProcessId;
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
        new Blob([new Uint8Array(fileReader.result as ArrayBuffer)]) // Q: Can I just directly use `fileReader.result`?
      ),
      ext = extname(file.name).toLowerCase();

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

export const maximize = (updateProcesses: Dispatch<ProcessAction>) => (
  id: string
): void => updateProcesses({ updates: { maximized: true }, id });

export const minimize = (updateProcesses: Dispatch<ProcessAction>) => (
  id: string,
  [, nextRemainingProcessId = '']: Array<string>
): string => {
  updateProcesses({ updates: { minimized: true }, id });

  return nextRemainingProcessId;
};

export const open = (
  processes: Processes,
  updateProcesses: Dispatch<ProcessAction>
) => (
  appFile: AppFile,
  previousState: ProcessState,
  startPosition: ProcessStartPosition
): string => {
  const { icon, name } = appFile,
    existingProcessId = getProcessId(name);

  if (processes.find(({ id: processId }) => processId === existingProcessId))
    return existingProcessId;

  const loader = appLoader(appFile);

  if (loader) {
    const process = new Process({
      loader,
      icon,
      name,
      ...loader.loaderOptions
    });

    updateProcesses({ process, previousState, startPosition });

    return process.id;
  }

  return '';
};

export const position = (updateProcesses: Dispatch<ProcessAction>) => (
  id: string
): RndDragCallback => (_event, { x, y }): void =>
  updateProcesses({ id, updates: { x, y } });

export const restore = (updateProcesses: Dispatch<ProcessAction>) => (
  id: string
): void =>
  updateProcesses({
    updates: { maximized: false, minimized: false },
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
