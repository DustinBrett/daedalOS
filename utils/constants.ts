export const MILLISECONDS_IN_SECOND = 1000;

export const baseZindex = 1000;
export const zindexLevelSize = 100;
export const iconsZindexLevel = 1;
export const windowsZindexLevel = 2;
export const taskbarZindexLevel = 3;
export const foregroundZindex =
  baseZindex + windowsZindexLevel * zindexLevelSize + zindexLevelSize / 2;

export const TASKBAR_ENTRY_WIDTH = 160;
export const TASKBAR_HEIGHT = 30;
export const TITLEBAR_HEIGHT = 22;
