import { useEffect, useRef, useState } from "react";
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

export const getFullscreenElement = (): Element | null => {
  const { mozFullScreenElement, webkitFullscreenElement } =
    document as FullscreenDocument;

  return (
    document.fullscreenElement ||
    mozFullScreenElement ||
    webkitFullscreenElement
  );
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
  const restoreDesktopRef = useRef(false);
  const toggleFullscreen = async (
    element?: HTMLElement | null,
    navigationUI?: FullscreenNavigationUI
  ): Promise<void> => {
    // State can be stale, the document always knows what is in fullscreen
    const currentFullscreenElement = getFullscreenElement();

    if (
      currentFullscreenElement &&
      (!element || element === currentFullscreenElement)
    ) {
      await exitFullscreen();

      if (restoreDesktopRef.current) {
        restoreDesktopRef.current = false;
        await enterFullscreen(document.documentElement, {
          navigationUI: "hide",
        });
      }
    } else {
      // Only Chrome switches full screen elements without exiting
      const mustExit =
        Boolean(currentFullscreenElement) && (isFirefox() || isSafari());

      restoreDesktopRef.current =
        mustExit && currentFullscreenElement === document.documentElement;

      if (mustExit) await exitFullscreen();

      await enterFullscreen(element || document.documentElement, {
        navigationUI: navigationUI || "hide",
      });
    }
  };

  useEffect(() => {
    const onFullscreenChange = (): void => {
      toggleKeyboardLock(getFullscreenElement()).then(() =>
        setFullscreenElement(getFullscreenElement())
      );
    };

    document.addEventListener("fullscreenchange", onFullscreenChange, {
      passive: true,
    });
    // Mobile can exit fullscreen in the background without firing the event
    document.addEventListener("visibilitychange", onFullscreenChange, {
      passive: true,
    });

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("visibilitychange", onFullscreenChange);
    };
  }, []);

  return { fullscreenElement, toggleFullscreen };
};

export default useViewportContextState;
