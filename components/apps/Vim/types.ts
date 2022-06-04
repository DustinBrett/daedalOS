export type QueueItem = {
  buffer: Buffer;
  url: string;
};

type VimModule = {
  FS_createDataFile?: (
    parentPath: string,
    newPath: string,
    data: Buffer,
    canRead: boolean,
    canWrite: boolean
  ) => void;
  FS_createPath?: (
    parentPath: string,
    newPath: string,
    canRead: boolean,
    canWrite: boolean
  ) => void;
  VIMJS_ALLOW_EXIT: boolean;
  arguments: string[];
  asmLibraryArg?: {
    _vimjs_prepare_exit: () => void;
  };
  exit?: () => void;
  loadedFS: boolean;
  memoryInitializerPrefixURL: string;
  preRun: (() => void)[];
  print: (args: unknown) => void;
  printErr: (args: unknown) => void;
  quitCallback: () => void;
  writeCallback: (buffer: Uint8Array) => void;
};

declare global {
  interface Window {
    VimModule?: VimModule;
    vimjs?: {
      pre_run: () => void;
    };
  }
}
