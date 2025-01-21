const DEFAULT_KEY = "DEFAULT";
const SET_KEY = "__setter__";

type SharedGlobal = {
  [key: string]: unknown;
  [DEFAULT_KEY]: unknown;
  [SET_KEY]: string;
};

declare global {
  interface Window {
    Module: {
      SDL2?: {
        audioContext: AudioContext;
      };
      arguments?: string[];
      canvas: HTMLCanvasElement;
      postRun: () => void;
      windowElement?: HTMLElement;
    };
    sharedGlobals?: Record<string, SharedGlobal>;
  }
}

export const cleanUpGlobals = (globals: string[]): void =>
  globals.forEach((globalKey) => {
    const resetKey = (): void => {
      Object.assign(window, { [globalKey]: undefined });
    };

    if (globalKey in window) {
      try {
        delete (window as never)[globalKey];
      } finally {
        resetKey();
      }
    }
  });

export const shareGlobal = (
  key: string,
  callees: string,
  assignTimeout: number
): void => {
  setTimeout(() => {
    if (window.sharedGlobals && key in window.sharedGlobals) {
      window.sharedGlobals[key][SET_KEY] = DEFAULT_KEY;
    }
  }, assignTimeout);

  window.sharedGlobals = window.sharedGlobals || {};

  if (key in window.sharedGlobals) {
    window.sharedGlobals[key][SET_KEY] = callees;
  } else {
    const defaultValue = window[key as keyof Window] as unknown;

    window.sharedGlobals[key] = {
      [DEFAULT_KEY]: defaultValue,
      [SET_KEY]: callees,
    };

    Object.defineProperty(window, key, {
      get() {
        if (window.sharedGlobals && key in window.sharedGlobals) {
          // eslint-disable-next-line unicorn/error-message
          const { stack = "" } = new Error();
          const match = Object.keys(window.sharedGlobals[key])
            .filter((calleeKey) => ![DEFAULT_KEY, SET_KEY].includes(calleeKey))
            .find((calleeKey) => new RegExp(calleeKey).test(stack));

          return window.sharedGlobals[key][match || DEFAULT_KEY];
        }

        return defaultValue;
      },
      set(value: unknown) {
        if (window.sharedGlobals && key in window.sharedGlobals) {
          window.sharedGlobals[key][window.sharedGlobals[key][SET_KEY]] = value;
        }
      },
    } as PropertyDescriptor);
  }
};
