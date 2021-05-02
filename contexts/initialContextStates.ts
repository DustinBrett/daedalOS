import type { FileSystemContextState } from 'contexts/fileSystem/useFileSystemContextState';
import type { ProcessContextState } from 'contexts/process/useProcessContextState';
import type { SessionContextState } from 'contexts/session/useSessionContextState';

export const initialFileSystemContextState: FileSystemContextState = {
  fs: null
};

export const initialProcessContextState: ProcessContextState = {
  close: () => undefined,
  linkElement: () => undefined,
  maximize: () => undefined,
  minimize: () => undefined,
  open: () => undefined,
  processes: {},
  title: () => undefined
};

export const initialSessionContextState: SessionContextState = {
  foregroundId: '',
  setForegroundId: () => undefined,
  setStackOrder: () => undefined,
  setThemeName: () => undefined,
  setWindowStates: () => undefined,
  stackOrder: [],
  themeName: '',
  windowStates: {}
};
