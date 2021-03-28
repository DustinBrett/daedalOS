import type { FileSystemContextState } from 'hooks/useFileSystemContextState';
import type { ProcessContextState } from 'hooks/useProcessContextState';
import type { SessionContextState } from 'hooks/useSessionContextState';

export const initialFileSystemContextState: FileSystemContextState = {
  fs: null
};

export const initialProcessContextState: ProcessContextState = {
  close: () => undefined,
  open: () => undefined,
  mapProcesses: () => [],
  maximize: () => undefined,
  minimize: () => undefined,
  processes: {}
};

export const initialSessionContextState: SessionContextState = {
  setThemeName: () => undefined,
  setWindowStates: () => undefined,
  themeName: '',
  windowStates: {}
};
