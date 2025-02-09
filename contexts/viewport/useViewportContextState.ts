import { useCallback, useEffect, useState } from "react";
import {
  type FullscreenDocument,
  type FullscreenElement,
  type NavigatorWithKeyboard,
  type ViewportContextState,
} from "contexts/viewport/types";
import { isFirefox, isSafari } from "utils/functions";

const FULLSCREEN_LOCKED_KEYS = ["MetaLeft", "MetaRight", "Escape"];

const enterFullscreen = async (
  element: FullscreenElement,
  options: FullscreenOptions
): Promise<void> => {
  try {
    if (element.requestFullscreen) {
      await element.requestFullscreen(options);
    } else if (element.mozRequestFullScreen) {
      await element.mozRequestFullScreen(options);
    } else if (element.webkitRequestFullscreen) {
      await element.webkitRequestFullscreen(options);
    }
  } catch {
    // Ignore failure while entering fullscreen
  }
};

const exitFullscreen = async (): Promise<void> => {
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
};

const toggleKeyboardLock = async (
  fullscreenElement: Element | null
): Promise<void> => {
  try {
    if (fullscreenElement === document.documentElement) {
      await (navigator as NavigatorWithKeyboard)?.keyboard?.lock?.(
        FULLSCREEN_LOCKED_KEYS
      );
    } else {
      (navigator as NavigatorWithKeyboard)?.keyboard?.unlock?.();
    }
  } catch {
    // Ignore failure to lock keys
  }
};

const useViewportContextState = (): ViewportContextState => {
  const [fullscreenElement, setFullscreenElement] = useState<Element | null>(
    // eslint-disable-next-line unicorn/no-null
    null
  );
  const toggleFullscreen = useCallback(
    async (
      element?: HTMLElement | null,
      navigationUI?: FullscreenNavigationUI
    ): Promise<void> => {
      if (fullscreenElement && (!element || element === fullscreenElement)) {
        await exitFullscreen();
      } else {
        // Only Chrome switches full screen elements without exiting
        if (fullscreenElement && (isFirefox() || isSafari())) {
          await exitFullscreen();
        }

        await enterFullscreen(element || document.documentElement, {
          navigationUI: navigationUI || "hide",
        });
      }
    },
    [fullscreenElement]
  );

  useEffect(() => {
    const onFullscreenChange = (): void => {
      const { mozFullScreenElement, webkitFullscreenElement } =
        document as FullscreenDocument;
      const currentFullscreenElement =
        document.fullscreenElement ||
        mozFullScreenElement ||
        webkitFullscreenElement;

      toggleKeyboardLock(currentFullscreenElement).then(() =>
        setFullscreenElement(currentFullscreenElement)
      );
    };

    document.addEventListener("fullscreenchange", onFullscreenChange, {
      passive: true,
    });

    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  return { fullscreenElement, toggleFullscreen };
};

export default useViewportContextState;
