import type { AppFile } from '@/types/utils/programs';
import type { Processes, ProcessState } from '@/types/utils/processmanager';
import type { RndDragCallback, RndResizeCallback } from 'react-rnd';

export type ProcessContextType = {
  processes: Processes;
  close: (id: string) => void;
  load: (
    file: File,
    previousState: ProcessState,
    launchElement: EventTarget
  ) => Promise<string>;
  maximize: (id: string) => void;
  minimize: (id: string) => void;
  open: (
    appFile: AppFile,
    previousState: ProcessState,
    launchElement: EventTarget
  ) => string;
  position: (id: string) => RndDragCallback;
  restore: (id: string, key: 'minimized' | 'maximized') => void;
  size: (id: string) => RndResizeCallback;
  taskbarElement: (id: string, element: HTMLButtonElement) => void;
  title: (id: string, name: string) => void;
};
