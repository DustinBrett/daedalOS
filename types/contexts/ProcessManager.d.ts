import type { RndDragCallback, RndResizeCallback } from 'react-rnd';
import type {
  Processes,
  ProcessState,
  ProcessStartPosition
} from '@/types/utils/processmanager';
import type { AppFile } from '@/types/utils/programs';

export type ProcessContextType = {
  processes: Processes;
  close: (id: string) => void;
  load: (
    file: File,
    previousState: ProcessState,
    startPosition: ProcessStartPosition
  ) => void;
  maximize: (id: string) => void;
  minimize: (id: string) => void;
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
