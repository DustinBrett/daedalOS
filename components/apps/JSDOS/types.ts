type FrameSizeCallback = (width: number, height: number) => void;

export type DosCI = {
  exit: () => void;
  frameHeight: number;
  frameWidth: number;
  events: () => {
    onFrameSize: (callback: FrameSizeCallback) => void;
  };
};

export type WindowWithDos = Window &
  typeof globalThis & {
    Dos: (
      element: HTMLElement
    ) => {
      run: (url: string) => Promise<DosCI>;
    };
    emulators: {
      pathPrefix: string;
    };
  };
