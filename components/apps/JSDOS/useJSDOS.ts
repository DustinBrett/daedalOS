import { dosOptions, libs, pathPrefix } from "components/apps/JSDOS/config";
import useDosCI from "components/apps/JSDOS/useDosCI";
import { closeWithTransition } from "components/system/Window/functions";
import useWindowSize from "components/system/Window/useWindowSize";
import { useProcesses } from "contexts/process";
import type { DosInstance } from "emulators-ui/dist/types/js-dos";
import { useEffect, useState } from "react";
import { loadFiles } from "utils/functions";

const useJSDOS = (
  id: string,
  url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>
): void => {
  const { updateWindowSize } = useWindowSize(id);
  const [dosInstance, setDosInstance] = useState<DosInstance>();
  const dosCI = useDosCI(id, url, containerRef, dosInstance);
  const { close } = useProcesses();

  useEffect(() => {
    if (!dosInstance) {
      loadFiles(libs).then(() => {
        window.emulators.pathPrefix = pathPrefix;

        if (containerRef.current instanceof HTMLDivElement) {
          setDosInstance(window.Dos(containerRef.current, dosOptions));
        }
      });
    }
  }, [containerRef, dosInstance]);

  useEffect(() => {
    if (dosCI) {
      updateWindowSize(dosCI.height(), dosCI.width());

      dosCI
        .events()
        .onMessage((_msgType, _eventType, command: string, message: string) => {
          if (command === "LOG_EXEC") {
            const [dosCommand] = message
              .replace("Parsing command line: ", "")
              .split(" ");

            if (dosCommand.toUpperCase() === "EXIT") {
              closeWithTransition(close, id);
            }
          }
        });

      dosCI
        .events()
        .onFrameSize((width, height) =>
          updateWindowSize(height * 2, width * 2)
        );

      dosCI
        .events()
        .onExit(() =>
          window.SimpleKeyboardInstances?.emulatorKeyboard?.destroy?.()
        );
    }
  }, [close, dosCI, id, updateWindowSize]);
};

export default useJSDOS;
