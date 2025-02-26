export type Emulator = {
  elements: {
    buttons: {
      saveState?: HTMLButtonElement;
    };
    container: HTMLDivElement;
  };
  loadState?: (state: Buffer) => void;
  muted?: boolean;
};

export type OnSaveState = (event: {
  screenshot: Uint8Array;
  state: Uint8Array;
}) => void;

export type OnGameStart = (
  event: Event & {
    detail: {
      emulator: Emulator;
    };
  }
) => void;

declare global {
  interface Window {
    Browser?: {
      mainLoop: {
        queue: unknown[];
        runIter: () => void;
        scheduler: () => void;
      };
      setCanvasSize: () => void;
    };
    EJS_Buttons?: {
      cacheManage: boolean;
      loadState: boolean;
      quickLoad: boolean;
      quickSave: boolean;
      saveState: boolean;
      screenRecord: boolean;
      screenshot: boolean;
    };
    EJS_RESET_VARS?: boolean;
    EJS_biosUrl?: string;
    EJS_core?: string;
    EJS_emulator?: {
      on: (event: string, callback: () => void) => void;
    };
    EJS_gameName?: string;
    EJS_gameUrl?: string;
    EJS_onGameStart?: OnGameStart;
    EJS_onSaveState?: OnSaveState;
    EJS_pathtodata?: string;
    EJS_player?: string;
    EJS_startOnLoaded?: boolean;
    EJS_terminate?: () => void;
    FS: unknown;
    GL?: {
      newRenderingFrameStarted: () => void;
    };
    IDBFS?: {
      reconcile: () => void;
    };
    JSEvents?: {
      runDeferredCalls: () => void;
    };
    RI?: {
      contexts: unknown[];
    };
    saveSaveFiles?: () => void;
  }
}
