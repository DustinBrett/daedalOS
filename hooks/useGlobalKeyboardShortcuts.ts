import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { useEffect, useRef } from "react";
import {
  haltEvent,
  toggleFullScreen,
  toggleShowDesktop,
} from "utils/functions";

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
let triggeringBinding = false;

const haltAndDebounceBinding = (event: KeyboardEvent): boolean => {
  haltEvent(event);

  if (triggeringBinding) return true;

  triggeringBinding = true;
  setTimeout(() => {
    triggeringBinding = false;
  }, 150);

  return false;
};

const metaCombos = new Set(["D", "E", "R"]);

const useGlobalKeyboardShortcuts = (): void => {
  const { close, minimize, open, processes } = useProcesses();
  const { foregroundId } = useSession();
  const altBindingsRef = useRef<Record<string, () => void>>({});
  const shiftBindingsRef = useRef<Record<string, () => void>>({
    E: () => open("FileExplorer"),
    ESCAPE: openStartMenu,
    F10: () => open("Terminal"),
    F12: () => open("DevTools"),
    F5: () => window.location.reload(),
    R: () => open("Run"),
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      const { altKey, ctrlKey, key, shiftKey } = event;
      const keyName = key?.toUpperCase();

      if (!keyName) return;

      if (shiftKey) {
        if (
          (ctrlKey || !metaCombos.has(keyName)) &&
          shiftBindingsRef.current?.[keyName] &&
          !haltAndDebounceBinding(event)
        ) {
          shiftBindingsRef.current[keyName]();
        }
      } else if (keyName === "F11") {
        haltEvent(event);
        toggleFullScreen();
      } else if (document.fullscreenElement) {
        if (keyName === "META") metaDown = true;
        else if (altKey && altBindingsRef.current?.[keyName]) {
          haltEvent(event);
          altBindingsRef.current?.[keyName]?.();
        } else if (keyName === "ESCAPE") {
          setTimeout(
            // eslint-disable-next-line unicorn/consistent-destructuring
            () => !event.defaultPrevented && document.exitFullscreen(),
            0
          );
        } else if (
          metaDown &&
          metaCombos.has(keyName) &&
          shiftBindingsRef.current?.[keyName] &&
          !haltAndDebounceBinding(event)
        ) {
          metaComboUsed = true;
          shiftBindingsRef.current[keyName]();
        }
      }
    };
    const onKeyUp = (event: KeyboardEvent): void => {
      if (
        metaDown &&
        document.fullscreenElement &&
        event.key?.toUpperCase() === "META"
      ) {
        metaDown = false;
        if (metaComboUsed) metaComboUsed = false;
        else openStartMenu();
      }
    };
    const onFullScreen = ({ target }: Event): void => {
      if (target === document.documentElement) {
        try {
          if (document.fullscreenElement) {
            (navigator as NavigatorWithKeyboard)?.keyboard?.lock?.([
              "MetaLeft",
              "MetaRight",
              "Escape",
            ]);
          } else {
            (navigator as NavigatorWithKeyboard)?.keyboard?.unlock?.();
          }
        } catch {
          // Ignore failure to lock keys
        }
      }
    };

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
  }, []);

  useEffect(() => {
    altBindingsRef.current = {
      ...altBindingsRef.current,
      F4: () => close(foregroundId),
    };
  }, [close, foregroundId]);

  useEffect(() => {
    shiftBindingsRef.current = {
      ...shiftBindingsRef.current,
      D: () => toggleShowDesktop(processes, minimize),
    };
  }, [minimize, open, processes]);
};

export default useGlobalKeyboardShortcuts;
