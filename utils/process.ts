import type { Dispatch } from 'react';
import type { RndDragCallback, RndResizeCallback } from 'react-rnd';
import type { Processes, ProcessAction, ProcessState } from '@/utils/pm.d';
import type { AppFile } from '@/utils/programs.d';

import { basename, extname } from 'path';
import { Process } from '@/utils/pm';
import { appLoader } from '@/utils/programs';
import { getFileIcon } from '@/utils/file';

export const close = (updateProcesses: Dispatch<ProcessAction>) => (
  id: string,
  [, nextRemainingProcessId]: Array<string>
): string | undefined => {
  updateProcesses({ id });

  if (nextRemainingProcessId) return nextRemainingProcessId;
};

export const load = (
  processes: Processes,
  updateProcesses: Dispatch<ProcessAction>
) => async (
  file: File,
  previousState?: ProcessState
): Promise<string | undefined> => {
  return new Promise((resolve) => {
    const fileReader = new FileReader();

    fileReader.addEventListener('loadend', () => {
      const url = URL.createObjectURL(
          new Blob([new Uint8Array(fileReader.result as ArrayBuffer)])
        ),
        ext = extname(file.name).toLowerCase();

      resolve(
        open(processes, updateProcesses)(
          {
            ext,
            icon: getFileIcon('', ext),
            name: basename(file.name, ext),
            url
          },
          previousState
        )
      );
    });

    fileReader.readAsArrayBuffer(file);
  });
};

export const maximize = (updateProcesses: Dispatch<ProcessAction>) => (
  id: string
): void => updateProcesses({ updates: { maximized: true }, id });

export const minimize = (updateProcesses: Dispatch<ProcessAction>) => (
  id: string,
  [, nextRemainingProcessId]: Array<string>
): string | undefined => {
  updateProcesses({ updates: { minimized: true }, id });

  if (nextRemainingProcessId) return nextRemainingProcessId;
};

export const open = (
  processes: Processes,
  updateProcesses: Dispatch<ProcessAction>
) => (appFile: AppFile, previousState?: ProcessState): string | undefined => {
  const { icon, name } = appFile,
    { id: existingProcessId } =
      processes.find(({ name: processName }) => processName === name) || {};

  if (existingProcessId) return existingProcessId;

  const loader = appLoader(appFile);

  if (loader) {
    const process = new Process({
      loader,
      icon,
      name,
      ...loader.loaderOptions
    });

    updateProcesses({ process, previousState });

    return process.id;
  }
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
