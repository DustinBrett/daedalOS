import { useProcesses } from "contexts/process";
import { useCallback, useEffect, useMemo } from "react";
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

let metaDown = false;
let metaComboUsed = false;

const metaCombos = new Set(["R"]);

const useGlobalKeyboardShortcuts = (): void => {
  const { open } = useProcesses();
  const shiftBindings: Record<string, () => void> = useMemo(
    () => ({
      ESCAPE: openStartMenu,
      F10: () => open("Terminal"),
      F12: () => open("DevTools"),
      F5: () => window.location.reload(),
      R: () => open("Run"),
    }),
    [open]
  );
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const { ctrlKey, key, shiftKey } = event;
      const keyName = key?.toUpperCase();

      if (!keyName) return;

      if (shiftKey) {
        if (shiftBindings[keyName] && (!requireCtrl.has(keyName) || ctrlKey)) {
          haltEvent(event);
          shiftBindings[keyName]();
        }
      } else if (keyName === "F11") {
        haltEvent(event);
        toggleFullScreen();
      } else if (document.fullscreenElement) {
        if (keyName === "META") metaDown = true;
        else if (metaDown && metaCombos.has(keyName)) {
          metaComboUsed = true;
          haltEvent(event);
          shiftBindings[keyName]();
        }
      }
    },
    [shiftBindings]
  );
  const onKeyUp = useCallback((event: KeyboardEvent) => {
    if (
      metaDown &&
      document.fullscreenElement &&
      event.key?.toUpperCase() === "META"
    ) {
      metaDown = false;
      if (metaComboUsed) metaComboUsed = false;
      else openStartMenu();
    }
  }, []);
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
    document.addEventListener("keyup", onKeyUp, {
      capture: true,
      passive: true,
    });
    document.addEventListener("fullscreenchange", onFullScreen, {
      passive: true,
    });

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("fullscreenchange", onFullScreen);
    };
  }, [onFullScreen, onKeyDown, onKeyUp]);
};

export default useGlobalKeyboardShortcuts;
