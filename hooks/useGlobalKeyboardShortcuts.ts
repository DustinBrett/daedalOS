import { useEffect, useRef } from "react";
import {
  SEARCH_BUTTON_TITLE,
  START_BUTTON_TITLE,
} from "components/system/Taskbar/functions";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { useViewport } from "contexts/viewport";
import { useProcessesRef } from "hooks/useProcessesRef";
import { KEYPRESS_DEBOUNCE_MS } from "utils/constants";
import { haltEvent, toggleShowDesktop, viewHeight } from "utils/functions";

declare global {
  interface Window {
    globalKeyStates?: {
      altKey: boolean;
      ctrlKey: boolean;
      metaKey: boolean;
      shiftKey: boolean;
    };
  }
}

const getByTitle = (title: string): HTMLButtonElement | null =>
  document.querySelector(
    `main > nav > div[title='${title}']`
  ) as HTMLButtonElement;

let metaDown = false;
let metaComboUsed = false;
let triggeringBinding = false;

const haltAndDebounceBinding = (event: KeyboardEvent): boolean => {
  haltEvent(event);

  if (triggeringBinding) return true;

  triggeringBinding = true;
  setTimeout(() => {
    triggeringBinding = false;
  }, KEYPRESS_DEBOUNCE_MS);

  return false;
};

const metaCombos = new Set(["ARROWDOWN", "ARROWUP", "D", "E", "R", "S", "X"]);

const updateKeyStates = (event: KeyboardEvent): void => {
  const { altKey, ctrlKey, shiftKey, metaKey } = event;

  window.globalKeyStates = { altKey, ctrlKey, metaKey, shiftKey };
};

const useGlobalKeyboardShortcuts = (): void => {
  const { closeWithTransition, maximize, minimize, open } = useProcesses();
  const processesRef = useProcessesRef();
  const { foregroundId, stackOrder } = useSession();
  const { fullscreenElement, toggleFullscreen } = useViewport();
  const altBindingsRef = useRef<Record<string, () => void>>({});
  const shiftBindingsRef = useRef<Record<string, () => void>>({
    E: () => open("FileExplorer"),
    ESCAPE: () => getByTitle(START_BUTTON_TITLE)?.click(),
    F10: () => open("Terminal"),
    F12: () => open("DevTools"),
    F5: () => window.location.reload(),
    R: () => open("Run"),
    S: () => getByTitle(SEARCH_BUTTON_TITLE)?.click(),
    X: () =>
      getByTitle(START_BUTTON_TITLE)?.dispatchEvent(
        new MouseEvent("contextmenu", {
          clientX: 1,
          clientY: viewHeight() - 1,
        })
      ),
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      updateKeyStates(event);

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
      } else if (fullscreenElement === document.documentElement) {
        if (keyName === "META") metaDown = true;
        else if (altKey && altBindingsRef.current?.[keyName]) {
          haltEvent(event);
          altBindingsRef.current?.[keyName]?.();
        } else if (keyName === "ESCAPE") {
          if (document.pointerLockElement) document.exitPointerLock();
          else toggleFullscreen();
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
      updateKeyStates(event);

      if (
        metaDown &&
        fullscreenElement === document.documentElement &&
        event.key?.toUpperCase() === "META"
      ) {
        metaDown = false;
        if (metaComboUsed) metaComboUsed = false;
        else getByTitle(START_BUTTON_TITLE)?.click();
      }
    };

    document.addEventListener("keydown", onKeyDown, {
      capture: true,
    });
    document.addEventListener("keyup", onKeyUp, {
      capture: true,
      passive: true,
    });

    return () => {
      document.removeEventListener("keydown", onKeyDown, {
        capture: true,
      });
      document.removeEventListener("keyup", onKeyUp, {
        capture: true,
      });
    };
  }, [fullscreenElement, toggleFullscreen]);

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
      D: () => toggleShowDesktop(processesRef.current, stackOrder, minimize),
    };
  }, [foregroundId, maximize, minimize, processesRef, stackOrder]);
};

export default useGlobalKeyboardShortcuts;
