import { useState } from "react";

type Fullscreen = {
  fullscreen: boolean;
  toggleFullscreen: (navigationUI?: FullscreenNavigationUI) => void;
};

type FullscreenDocument = Document & {
  mozCancelFullScreen: () => Promise<void>;
  mozFullScreenElement: HTMLElement;
  mozFullScreenEnabled: boolean;
  webkitExitFullscreen: () => Promise<void>;
  webkitFullscreenElement: HTMLElement;
  webkitFullscreenEnabled: boolean;
};

type FullscreenElement = HTMLElement & {
  mozRequestFullScreen: (options?: FullscreenOptions) => Promise<void>;
  webkitRequestFullscreen: (options?: FullscreenOptions) => Promise<void>;
};

const useFullscreen = (element?: HTMLElement | null): Fullscreen => {
  const [fullscreen, setFullscreen] = useState(false);
  const monitorFullscreenEvent = (): void => {
    const fullscreenDocument = document as FullscreenDocument;
    const exitFullscreenEvent = (): void => {
      if (
        !fullscreenDocument.fullscreenElement &&
        !fullscreenDocument.fullscreenEnabled &&
        !fullscreenDocument.mozFullScreenElement &&
        !fullscreenDocument.mozFullScreenEnabled &&
        !fullscreenDocument.webkitFullscreenElement &&
        !fullscreenDocument.webkitFullscreenEnabled
      ) {
        document.removeEventListener("fullscreenchange", exitFullscreenEvent);
        setFullscreen(false);
      }
    };

    if (
      fullscreenDocument.fullscreenElement ||
      fullscreenDocument.fullscreenEnabled ||
      fullscreenDocument.mozFullScreenElement ||
      fullscreenDocument.mozFullScreenEnabled ||
      fullscreenDocument.webkitFullscreenElement ||
      fullscreenDocument.webkitFullscreenEnabled
    ) {
      setFullscreen(true);
      document.addEventListener("fullscreenchange", exitFullscreenEvent);
    }
  };
  const toggleFullscreen = (navigationUI?: FullscreenNavigationUI): void => {
    if (fullscreen) {
      const fullscreenDocument = document as FullscreenDocument;

      if (fullscreenDocument.exitFullscreen) {
        fullscreenDocument.exitFullscreen();
      } else if (fullscreenDocument.mozCancelFullScreen) {
        fullscreenDocument.mozCancelFullScreen();
      } else if (fullscreenDocument.webkitExitFullscreen) {
        fullscreenDocument.webkitExitFullscreen();
      }
    } else {
      const fullScreenElement = element || document.documentElement;
      const fullscreenOptions: FullscreenOptions = {
        navigationUI: navigationUI || "hide",
      };

      try {
        if ("requestFullscreen" in fullScreenElement) {
          fullScreenElement
            .requestFullscreen(fullscreenOptions)
            .then(monitorFullscreenEvent);
        } else if ("mozRequestFullScreen" in fullScreenElement) {
          (fullScreenElement as FullscreenElement)
            .mozRequestFullScreen(fullscreenOptions)
            .then(monitorFullscreenEvent);
        } else if ("webkitRequestFullscreen" in fullScreenElement) {
          (fullScreenElement as FullscreenElement)
            .webkitRequestFullscreen(fullscreenOptions)
            .then(monitorFullscreenEvent);
        }
      } catch {
        monitorFullscreenEvent();
      }
    }
  };

  return {
    fullscreen,
    toggleFullscreen,
  };
};

export default useFullscreen;
