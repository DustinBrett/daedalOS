import { useProcesses } from "contexts/process";
import { useCallback, useEffect } from "react";
import { haltEvent } from "utils/functions";

const useGlobalKeyboardShortcuts = (): void => {
  const { open } = useProcesses();
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const { key, shiftKey } = event;

      if (shiftKey) {
        if (key === "F12") {
          haltEvent(event);
          open("DevTools");
        } else if (key === "Escape") {
          haltEvent(event);

          const startButton = document.querySelector(
            "main>nav>button[title='Start']"
          ) as HTMLButtonElement;

          startButton?.click();
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
