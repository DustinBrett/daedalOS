import { useProcesses } from "contexts/process";
import { useCallback, useEffect } from "react";
import { haltEvent, toggleFullScreen } from "utils/functions";

const requireCtrl = new Set(["R"]);

type NavigatorWithKeyboard = Navigator & {
  keyboard?: {
    lock?: (keys?: string[]) => void;
    unlock?: () => void;
  };
};

const openStartMenu = (): void =>
  (
    document.querySelector(
      "main>nav>button[title='Start']"
    ) as HTMLButtonElement
  )?.click();

const useGlobalKeyboardShortcuts = (): void => {
  const { open } = useProcesses();
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const { ctrlKey, key, shiftKey } = event;
      const keyName = key?.toUpperCase();

      if (!keyName) return;

      if (shiftKey) {
        const shiftBindings: Record<string, () => void> = {
          ESCAPE: openStartMenu,
          F10: () => open("Terminal"),
          F12: () => open("DevTools"),
          F5: () => window.location.reload(),
          R: () => open("Run"),
        };

        if (shiftBindings[keyName] && (!requireCtrl.has(keyName) || ctrlKey)) {
          haltEvent(event);
          shiftBindings[keyName]();
        }
      } else if (keyName === "F11") {
        haltEvent(event);
        toggleFullScreen();
      } else if (keyName === "META" && document.fullscreenElement) {
        openStartMenu();
      }
    },
    [open]
  );
  const onFullScreen = useCallback(({ target }: Event) => {
    if (target === document.documentElement) {
      try {
        if (document.fullscreenElement) {
          (navigator as NavigatorWithKeyboard)?.keyboard?.lock?.([
            "MetaLeft",
            "MetaRight",
          ]);
        } else {
          (navigator as NavigatorWithKeyboard)?.keyboard?.unlock?.();
        }
      } catch {
        // Ignore failure to lock keys
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown, {
      capture: true,
    });
    document.addEventListener("fullscreenchange", onFullScreen, {
      passive: true,
    });

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("fullscreenchange", onFullScreen);
    };
  }, [onFullScreen, onKeyDown]);
};

export default useGlobalKeyboardShortcuts;
