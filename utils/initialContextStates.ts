import type { FileSystemContextState } from 'hooks/useFileSystemContextState';
import type { ProcessContextState } from 'hooks/useProcessContextState';
import type { SessionContextState } from 'hooks/useSessionContextState';

export const initialFileSystemContextState: FileSystemContextState = {
  fs: null
};

export const initialProcessContextState: ProcessContextState = {
  close: () => undefined,
  open: () => undefined,
  mapProcesses: () => []
};

export const initialSessionContextState: SessionContextState = {
  themeName: '',
  setThemeName: () => undefined
};
