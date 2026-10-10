import { useEffect, useRef } from "react";
import {
  SEARCH_BUTTON_TITLE,
  START_BUTTON_TITLE,
} from "components/system/Taskbar/functions";
import useWindowActions from "components/system/Window/Titlebar/useWindowActions";
import {
  getProcess,
  getProcesses,
  useProcessesActions,
} from "contexts/process";
import { useForegroundId, useStackOrder } from "contexts/session";
import { useViewport } from "contexts/viewport";
import { KEYPRESS_DEBOUNCE_MS, PREVENT_SCROLL } from "utils/constants";
import { haltEvent, toggleShowDesktop, viewHeight } from "utils/functions";
import {
  focusDesktop,
  isEditableElement,
  openContextMenu,
  trackKeyboardNavigation,
  whenUnhandled,
} from "utils/keyboard";

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

export const getNavButtonByTitle = (
  title: string
): HTMLButtonElement | undefined => {
  try {
    return document.querySelector(
      `main > nav > [title='${CSS.escape(title)}']`
    ) as HTMLButtonElement;
  } catch {
    return undefined;
  }
};

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

// Text fields keep these for selecting text & their own context menu
const TEXT_FIELD_KEYS = new Set(["ARROWDOWN", "ARROWUP", "F10"]);

// Terminals & code editors type into hidden text boxes, which select nothing
const CODE_EDITOR_SELECTOR = ".monaco-editor, .xterm";

const isTextFieldKey = (keyName: string, element: Element | null): boolean =>
  TEXT_FIELD_KEYS.has(keyName) &&
  isEditableElement(element) &&
  (keyName === "F10" || !element?.closest(CODE_EDITOR_SELECTOR));

const FLYOUT_SELECTORS: Record<string, string> = {
  ESCAPE: "#startMenu",
  S: "#searchMenu",
};

const updateKeyStates = (event: KeyboardEvent): void => {
  const { altKey, ctrlKey, metaKey, shiftKey } = event;

  window.globalKeyStates = { altKey, ctrlKey, metaKey, shiftKey };
};

const focusedElement = (): HTMLElement | undefined =>
  document.activeElement instanceof HTMLElement &&
  document.activeElement !== document.body
    ? document.activeElement
    : undefined;

const openWindowMenu = (id: string): void => {
  const titlebar = getProcess(id)?.componentWindow?.querySelector("header");

  if (titlebar) {
    const { bottom, left } = titlebar.getBoundingClientRect();

    titlebar.dispatchEvent(
      new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        clientX: Math.round(left),
        clientY: Math.round(bottom),
        view: window,
      })
    );
  }
};

const useGlobalKeyboardShortcuts = (): void => {
  const { minimize, open } = useProcessesActions();
  const foregroundId = useForegroundId();
  const stackOrder = useStackOrder();
  const { fullscreenElement, toggleFullscreen } = useViewport();
  const { onClose, onMaximize, onMinimize } = useWindowActions(foregroundId);
  const altBindingsRef = useRef<Record<string, () => void>>({});
  const shiftBindingsRef = useRef<Record<string, () => void>>({
    E: () => open("FileExplorer"),
    ESCAPE: () => getNavButtonByTitle(START_BUTTON_TITLE)?.click(),
    F10: () => {
      const element = focusedElement();

      if (element) openContextMenu(element);
      else open("Terminal");
    },
    F12: () => open("DevTools"),
    F5: () => window.location.reload(),
    R: () => open("Run"),
    S: () => getNavButtonByTitle(SEARCH_BUTTON_TITLE)?.click(),
    X: () =>
      getNavButtonByTitle(START_BUTTON_TITLE)?.dispatchEvent(
        new MouseEvent("contextmenu", {
          clientX: 1,
          clientY: viewHeight() - 1,
        })
      ),
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      updateKeyStates(event);

      const { ctrlKey, key, shiftKey } = event;
      const keyName = key?.toUpperCase();

      if (!keyName) return;

      // AltGr arrives as Ctrl+Alt, though it is typing a character
      const altKey = event.altKey && !event.getModifierState("AltGraph");

      if (
        keyName === "CONTEXTMENU" &&
        !isEditableElement(document.activeElement)
      ) {
        // Unless an app like V86 kept the key for itself
        whenUnhandled(event, () => {
          const element = focusedElement() || focusDesktop();

          event.preventDefault();
          if (element) openContextMenu(element);
        });
      } else if (shiftKey) {
        const { activeElement } = document;
        const flyout = FLYOUT_SELECTORS[keyName];

        // A flyout's own shortcut is left to it, which closes it like Escape
        if (flyout && document.querySelector(flyout)?.contains(activeElement)) {
          return;
        }

        if (
          (ctrlKey || !metaCombos.has(keyName)) &&
          shiftBindingsRef.current?.[keyName] &&
          !isTextFieldKey(keyName, activeElement) &&
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
        haltEvent(event);
        altBindingsRef.current?.[keyName]?.();
      } else if (fullscreenElement === document.documentElement) {
        if (keyName === "META") metaDown = true;
        else if (altKey && altBindingsRef.current?.[keyName]) {
          haltEvent(event);
          altBindingsRef.current?.[keyName]?.();
        } else if (keyName === "ESCAPE") {
          // Unless something in the page, like a menu or dialog, used it
          whenUnhandled(event, () => {
            if (document.pointerLockElement) document.exitPointerLock();
            else toggleFullscreen();
          });
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
        else getNavButtonByTitle(START_BUTTON_TITLE)?.click();
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

  useEffect(trackKeyboardNavigation, []);

  useEffect(() => {
    altBindingsRef.current = {
      ...altBindingsRef.current,
      " ": () => openWindowMenu(foregroundId),
      F4: () => foregroundId && onClose(),
    };
  }, [foregroundId, onClose]);

  useEffect(() => {
    shiftBindingsRef.current = {
      ...shiftBindingsRef.current,
      ARROWDOWN: () => {
        const {
          hideMinimizeButton = false,
          maximized,
          minimized,
          taskbarEntry,
        } = getProcess(foregroundId) || {};

        if (maximized) {
          onMaximize();
        } else if (!minimized && !hideMinimizeButton) {
          onMinimize(true);
          // Focus waits on its taskbar button, from where it can come back
          taskbarEntry?.focus(PREVENT_SCROLL);
        }
      },
      ARROWUP: () => {
        const {
          allowResizing = true,
          hideMaximizeButton = false,
          maximized,
          minimized,
        } = getProcess(foregroundId) || {};

        if (minimized) {
          onMinimize(true);
        } else if (!maximized && allowResizing && !hideMaximizeButton) {
          onMaximize();
        }
      },
      D: () => toggleShowDesktop(getProcesses(), stackOrder, minimize),
    };
  }, [foregroundId, minimize, onMaximize, onMinimize, stackOrder]);
};

export default useGlobalKeyboardShortcuts;
