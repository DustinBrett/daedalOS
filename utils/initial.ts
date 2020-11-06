import type { RndDragCallback, RndResizeCallback } from 'react-rnd';
import type { SessionProcessState } from '@/types/contexts/SessionManager';

export const initialSessionState = {
  session: {
    foregroundId: '',
    states: {},
    stackOrder: []
  },
  foreground: (): void => undefined,
  getState: (): SessionProcessState => ({
    id: '',
    height: 0,
    width: 0,
    x: 0,
    y: 0
  }),
  saveState: (): void => undefined
};

export const initialProcessState = {
  processes: [],
  close: (): string => '',
  load: (): Promise<string> => new Promise((resolve) => resolve()),
  maximize: (): void => undefined,
  minimize: (): string => '',
  open: (): string => '',
  position: (): RndDragCallback => () => false,
  restore: (): void => undefined,
  size: (): RndResizeCallback => () => false,
  taskbarElement: (): void => undefined,
  title: (): void => undefined
};
