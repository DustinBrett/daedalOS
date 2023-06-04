import { useEffect, useState } from "react";

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
  mozRequestFullScreen?: (options?: FullscreenOptions) => Promise<void>;
  webkitRequestFullscreen?: (options?: FullscreenOptions) => Promise<void>;
};

const isFullscreen = (): boolean => {
  const { fullscreenElement, mozFullScreenElement, webkitFullscreenElement } =
    document as FullscreenDocument;

  return Boolean(
    fullscreenElement || mozFullScreenElement || webkitFullscreenElement
  );
};

const useFullscreen = (element?: HTMLElement | null): Fullscreen => {
  const [fullscreen, setFullscreen] = useState(false);
  const toggleFullscreen = async (
    navigationUI?: FullscreenNavigationUI
  ): Promise<void> => {
    if (fullscreen) {
      const fullscreenDocument = document as FullscreenDocument;

      try {
        if (fullscreenDocument.exitFullscreen) {
          await fullscreenDocument.exitFullscreen();
        } else if (fullscreenDocument.mozCancelFullScreen) {
          await fullscreenDocument.mozCancelFullScreen();
        } else if (fullscreenDocument.webkitExitFullscreen) {
          await fullscreenDocument.webkitExitFullscreen();
        }
      } catch {
        // Ignore failure while exiting fullscreen
      }
    } else {
      const fullScreenElement = (element ||
        document.documentElement) as FullscreenElement;
      const fullscreenOptions: FullscreenOptions = {
        navigationUI: navigationUI || "hide",
      };

      try {
        if (fullScreenElement.requestFullscreen) {
          await fullScreenElement.requestFullscreen(fullscreenOptions);
        } else if (fullScreenElement.mozRequestFullScreen) {
          await fullScreenElement.mozRequestFullScreen(fullscreenOptions);
        } else if (fullScreenElement.webkitRequestFullscreen) {
          await fullScreenElement.webkitRequestFullscreen(fullscreenOptions);
        }
      } catch {
        // Ignore failure while entering fullscreen
      }
    }
  };

  useEffect(() => {
    const monitorFullscreenState = (): void => setFullscreen(isFullscreen());

    document.addEventListener("fullscreenchange", monitorFullscreenState);

    return () =>
      document.removeEventListener("fullscreenchange", monitorFullscreenState);
  }, []);

  return {
    fullscreen,
    toggleFullscreen,
  };
};

export default useFullscreen;
