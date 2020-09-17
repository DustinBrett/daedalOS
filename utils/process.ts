import type { Dispatch } from 'react';
import type { RndDragCallback, RndResizeCallback } from 'react-rnd';
import type { Processes, ProcessAction } from '@/utils/pm.d';

import { extname } from 'path';
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
) => (file: File): string | undefined => {
  const fileReader = new FileReader();

  fileReader.addEventListener('loadend', () => {
    const url = URL.createObjectURL(new Blob([new Uint8Array(fileReader.result as ArrayBuffer)]));

    open(processes, updateProcesses)(`blob:${url}?name=${file.name}`, getFileIcon('', extname(file.name)), file.name);
  });

  fileReader.readAsArrayBuffer(file);

  return ''; // TODO: Return loaded id
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
) => (url: string, icon: string, name: string): string | undefined => {
  const { id: existingProcessId } =
    processes.find(({ name: processName }) => processName === name) || {};

  if (existingProcessId) return existingProcessId;

  const loader = appLoader(url, name);

  if (loader) {
    const process = new Process({
      loader,
      icon,
      name,
      ...loader.loaderOptions
    });

    updateProcesses({ process });

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
