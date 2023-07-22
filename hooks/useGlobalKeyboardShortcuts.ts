import useFullscreen from "components/apps/Photos/useFullscreen";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { useProcessesRef } from "hooks/useProcessesRef";
import { useEffect, useRef } from "react";
import { haltEvent, toggleShowDesktop } from "utils/functions";

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

const metaCombos = new Set(["ARROWDOWN", "ARROWUP", "D", "E", "R"]);

const useGlobalKeyboardShortcuts = (): void => {
  const { closeWithTransition, maximize, minimize, open } = useProcesses();
  const processesRef = useProcessesRef();
  const { foregroundId } = useSession();
  const { fullscreen, toggleFullscreen } = useFullscreen();
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
        toggleFullscreen();
      } else if (
        document.activeElement === document.body &&
        keyName.startsWith("ARROW")
      ) {
        document.body.querySelector("main ol li button")?.dispatchEvent(
          new MouseEvent("mousedown", {
            bubbles: true,
          })
        );
      } else if (ctrlKey && altKey && altBindingsRef.current?.[keyName]) {
        altBindingsRef.current?.[keyName]?.();
      } else if (fullscreen) {
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
      if (metaDown && fullscreen && event.key?.toUpperCase() === "META") {
        metaDown = false;
        if (metaComboUsed) metaComboUsed = false;
        else openStartMenu();
      }
    };
    const onFullScreen = ({ target }: Event): void => {
      if (target === document.documentElement) {
        try {
          if (fullscreen) {
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
  }, [fullscreen, toggleFullscreen]);

  useEffect(() => {
    altBindingsRef.current = {
      ...altBindingsRef.current,
      F4: () => closeWithTransition(foregroundId),
    };
  }, [closeWithTransition, foregroundId]);

  useEffect(() => {
    shiftBindingsRef.current = {
      ...shiftBindingsRef.current,
      ARROWDOWN: () => {
        const {
          hideMinimizeButton = false,
          maximized,
          minimized,
        } = processesRef.current[foregroundId];

        if (maximized) {
          maximize(foregroundId);
        } else if (!minimized && !hideMinimizeButton) {
          minimize(foregroundId);
        }
      },
      ARROWUP: () => {
        const {
          allowResizing = true,
          hideMaximizeButton = false,
          maximized,
          minimized,
        } = processesRef.current[foregroundId];

        if (minimized) {
          minimize(foregroundId);
        } else if (!maximized && allowResizing && !hideMaximizeButton) {
          maximize(foregroundId);
        }
      },
      D: () => toggleShowDesktop(processesRef.current, minimize),
    };
  }, [foregroundId, maximize, minimize, processesRef]);
};

export default useGlobalKeyboardShortcuts;
