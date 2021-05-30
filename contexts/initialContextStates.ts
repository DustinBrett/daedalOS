import type { FileSystemContextState } from 'contexts/fileSystem/useFileSystemContextState';
import type { MenuContextState } from 'contexts/menu/useMenuContextState';
import type { ProcessContextState } from 'contexts/process/useProcessContextState';
import type { SessionContextState } from 'contexts/session/useSessionContextState';

export const initialFileSystemContextState: FileSystemContextState = {
  fs: null,
  mountFs: () => undefined,
  unMountFs: () => undefined
};

export const initialMenuContextState: MenuContextState = {
  contextMenu: () => () => undefined,
  menu: {},
  setMenu: () => undefined
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
  startMenuVisible: false,
  themeName: '',
  toggleStartMenu: () => undefined,
  windowStates: {}
};
