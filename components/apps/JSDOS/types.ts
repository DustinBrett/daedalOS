type FrameSizeCallback = (width: number, height: number) => void;

type MessageCallback = (
  msgType: string,
  eventType: string,
  command: string,
  message: string
) => void;

export type DosCI = {
  exit: () => void;
  frameHeight: number;
  frameWidth: number;
  events: () => {
    onFrameSize: (callback: FrameSizeCallback) => void;
    onMessage: (callback: MessageCallback) => void;
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
    SimpleKeyboardInstances: {
      emulatorKeyboard: {
        destroy: () => void;
      };
    };
  }
}
