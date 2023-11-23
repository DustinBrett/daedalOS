import { type EmscriptenFS } from "contexts/fileSystem/useAsyncFs";

export type QueueItem = {
  buffer: Buffer;
  url: string;
};

type VimModule = {
  FS?: EmscriptenFS;
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
  containerWindow?: HTMLElement | null;
  exit?: () => void;
  memoryInitializerPrefixURL: string;
  postRun: (() => void)[];
  preRun: (() => void)[];
  print: (args: unknown) => void;
  printErr: (args: unknown) => void;
  quitCallback: () => void;
  writeCallback: (buffer: Uint8Array) => void;
};

declare global {
  interface Window {
    VimWrapperModule?: {
      VimModule?: VimModule;
      init?: (config: VimModule) => void;
    };
  }
}
