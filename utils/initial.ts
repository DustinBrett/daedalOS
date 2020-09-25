import type { ProcessState } from '@/types/utils/processmanager';
import type { RndDragCallback, RndResizeCallback } from 'react-rnd';

export const initialSessionState = {
  session: {
    foregroundId: '',
    states: {},
    stackOrder: []
  },
  background: (): void => undefined,
  foreground: (): void => undefined,
  getState: (): ProcessState => ({}),
  saveState: (): void => undefined
};

export const initialProcessState = {
  processes: [],
  close: (): string => '',
  load: (): void => undefined,
  maximize: (): void => undefined,
  minimize: (): string => '',
  open: (): string => '',
  position: (): RndDragCallback => () => false,
  restore: (): void => undefined,
  size: (): RndResizeCallback => () => false,
  title: (): void => undefined
};
