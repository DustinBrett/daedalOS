import type { RndDragCallback, RndResizeCallback } from 'react-rnd';
import type {
  Processes,
  ProcessState,
  ProcessStartPosition
} from '@/utils/processmanager.d';
import type { AppFile } from '@/utils/programs.d';

export type ProcessContextType = {
  processes: Processes;
  close: (id: string, stackOrder: Array<string>) => string;
  load: (
    file: File,
    previousState: ProcessState,
    startPosition: ProcessStartPosition
  ) => void;
  maximize: (id: string) => void;
  minimize: (id: string, stackOrder: Array<string>) => string;
  open: (
    appFile: AppFile,
    previousState: ProcessState,
    startPosition: ProcessStartPosition
  ) => string;
  position: (id: string) => RndDragCallback;
  restore: (id: string) => void;
  size: (id: string) => RndResizeCallback;
  title: (id: string, name: string) => void;
};
