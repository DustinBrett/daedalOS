import type { FileSystemContextState } from 'contexts/fileSystem/useFileSystemContextState';
import type { ProcessContextState } from 'contexts/process/useProcessContextState';
import type { SessionContextState } from 'contexts/session/useSessionContextState';

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
