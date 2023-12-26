export type ViewportContextState = {
  fullscreenElement: Element | null;
  toggleFullscreen: (
    element?: HTMLElement | null,
    navigationUI?: FullscreenNavigationUI
  ) => Promise<void>;
};

export type FullscreenDocument = Document & {
  mozCancelFullScreen: () => Promise<void>;
  mozFullScreenElement: Element | null;
  webkitExitFullscreen: () => Promise<void>;
  webkitFullscreenElement: Element | null;
};

export type FullscreenElement = HTMLElement & {
  mozRequestFullScreen?: (options?: FullscreenOptions) => Promise<void>;
  webkitRequestFullscreen?: (options?: FullscreenOptions) => Promise<void>;
};

export type NavigatorWithKeyboard = Navigator & {
  keyboard?: {
    lock?: (keys?: string[]) => Promise<void>;
    unlock?: () => void;
  };
};
