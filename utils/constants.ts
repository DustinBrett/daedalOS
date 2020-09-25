export const MILLISECONDS_IN_SECOND = 1000;

// NOTE: Sync constants with `@/styles/variables.scss`
export const baseZindex = 1000;
export const zindexLevelSize = 100;
export const iconsZindexLevel = 1;
export const windowsZindexLevel = 2;
export const taskbarZindexLevel = 3;
export const foregroundZindex =
  baseZindex + windowsZindexLevel * zindexLevelSize + zindexLevelSize / 2;

// NOTE: Sync constants with `@/styles/maps.scss`
export const taskbarEntryWidth = 160;
