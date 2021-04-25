type FrameSizeCallback = (width: number, height: number) => void;

export type DosCI = {
  exit: () => void;
  frameHeight: number;
  frameWidth: number;
  events: () => {
    onFrameSize: (callback: FrameSizeCallback) => void;
  };
};

declare global {
  interface Window {
    Dos: (
      element: HTMLElement
    ) => {
      run: (url: string) => Promise<DosCI>;
    };
    emulators: {
      pathPrefix: string;
    };
  }
}
