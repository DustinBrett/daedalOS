import { dosOptions, libs, pathPrefix } from "components/apps/JSDOS/config";
import useDosCI from "components/apps/JSDOS/useDosCI";
import useWindowSize from "components/system/Window/useWindowSize";
import { useProcesses } from "contexts/process";
import type { DosInstance } from "emulators-ui/dist/types/js-dos";
import { useEffect, useState } from "react";
import { loadFiles } from "utils/functions";

const useJSDOS = (
  id: string,
  url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  const { updateWindowSize } = useWindowSize(id);
  const [dosInstance, setDosInstance] = useState<DosInstance>();
  const dosCI = useDosCI(id, url, containerRef, dosInstance);
  const { closeWithTransition } = useProcesses();

  useEffect(() => {
    if (!dosInstance) {
      loadFiles(libs).then(() => {
        window.emulators.pathPrefix = pathPrefix;

        if (containerRef.current) {
          setDosInstance(window.Dos(containerRef.current, dosOptions));
          setLoading(false);
        }
      });
    }
  }, [containerRef, dosInstance, setLoading]);

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
              closeWithTransition(id);
            }
          }
        });

      dosCI.events().onFrameSize((width, height) => {
        const {
          height: instanceHeight = height,
          width: instanceWidth = width,
        } = dosInstance?.layers || {};
        const frameSizeHalved =
          height === instanceHeight / 2 && width === instanceWidth / 2;
        const { height: currentHeight = 0, width: currentWidth = 0 } =
          containerRef.current?.getBoundingClientRect() || {};
        const [frameHeight, frameWidth] = [
          frameSizeHalved ? instanceHeight : height,
          frameSizeHalved ? instanceWidth : width,
        ];

        if (frameHeight !== currentHeight || frameWidth !== currentWidth) {
          updateWindowSize(frameHeight, frameWidth);
        }
      });

      dosCI
        .events()
        .onExit(() =>
          window.SimpleKeyboardInstances?.emulatorKeyboard?.destroy()
        );
    }
  }, [
    closeWithTransition,
    containerRef,
    dosCI,
    dosInstance,
    id,
    updateWindowSize,
  ]);
};

export default useJSDOS;
