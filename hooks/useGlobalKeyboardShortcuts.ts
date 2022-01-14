import { useProcesses } from "contexts/process";
import { useCallback, useEffect } from "react";
import { haltEvent } from "utils/functions";

const useGlobalKeyboardShortcuts = (): void => {
  const { open } = useProcesses();
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const { key, shiftKey } = event;

      if (shiftKey) {
        const shiftBindings: Record<string, () => void> = {
          Escape: () => {
            const startButton = document.querySelector(
              "main>nav>button[title='Start']"
            ) as HTMLButtonElement;

            startButton?.click();
          },
          F10: () => open("Terminal"),
          F12: () => open("DevTools"),
          F5: () => window.location.reload(),
        };

        if (shiftBindings[key]) {
          haltEvent(event);
          shiftBindings[key]();
        }
      }
    },
    [open]
  );

  useEffect(() => {
    document.body.addEventListener("keydown", onKeyDown, {
      capture: true,
    });

    return () => document.body.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);
};

export default useGlobalKeyboardShortcuts;
