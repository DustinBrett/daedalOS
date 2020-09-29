import type { Dispatch } from 'react';
import type { RndDragCallback, RndResizeCallback } from 'react-rnd';
import type {
  Processes,
  ProcessAction,
  ProcessState,
  ProcessStartPosition,
  ProcessConstructor
} from '@/types/utils/processmanager';
import type { AppFile } from '@/types/utils/programs';

import { basename, extname } from 'path';
import { getProcessId } from '@/utils/processmanager';
import { appLoader } from '@/utils/programs';
import { getFileIcon } from '@/utils/file';

export class Process {
  loader;
  icon;
  name;

  bgColor;
  height;
  hideScrollbars;
  id;
  lockAspectRatio;
  width;
  windowed;

  maximized = false;
  minimized = false;

  x;
  y;
  startX;
  startY;
  startIndex;

  constructor({
    loader,
    icon,
    name,

    bgColor = '#fff',
    height = 0,
    hideScrollbars = false,
    id = getProcessId(name),
    lockAspectRatio = false,
    width = 0,
    windowed = true,
    x = 0,
    y = 0,
    startX = 0,
    startY = 0,
    startIndex = -1
  }: ProcessConstructor) {
    this.loader = loader;
    this.icon = icon;
    this.name = name;
    this.bgColor = bgColor;
    this.height = height;
    this.hideScrollbars = hideScrollbars;
    this.id = id;
    this.lockAspectRatio = lockAspectRatio;
    this.width = width;
    this.windowed = windowed;
    this.x = x;
    this.y = y;
    this.startX = startX;
    this.startY = startY;
    this.startIndex = startIndex;
  }
}

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
