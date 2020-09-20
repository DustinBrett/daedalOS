import type { RndDragCallback, RndResizeCallback } from 'react-rnd';
import type { Processes, ProcessState } from '@/utils/pm.d';
import type { AppFile } from '@/utils/programs.d';

export type ProcessContextType = {
  processes: Processes;
  close: (id: string, stackOrder: Array<string>) => string;
  load: (file: File, previousState: ProcessState) => void;
  maximize: (id: string) => void;
  minimize: (id: string, stackOrder: Array<string>) => string;
  open: (appFile: AppFile, previousState: ProcessState) => string;
  position: (id: string) => RndDragCallback;
  restore: (id: string) => void;
  size: (id: string) => RndResizeCallback;
  title: (id: string, name: string) => void;
};
