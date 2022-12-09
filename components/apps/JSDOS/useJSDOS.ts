import {
  CAPTURED_KEYS,
  dosOptions,
  pathPrefix,
} from "components/apps/JSDOS/config";
import useDosCI from "components/apps/JSDOS/useDosCI";
import useWindowSize from "components/system/Window/useWindowSize";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import type { DosInstance } from "emulators-ui/dist/types/js-dos";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { PREVENT_SCROLL } from "utils/constants";
import { loadFiles, pxToNum } from "utils/functions";

const captureKeys = (event: KeyboardEvent): void => {
  if (CAPTURED_KEYS.has(event.key)) event.preventDefault();
};

const useJSDOS = (
  id: string,
  url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  loading: boolean
): void => {
  const { updateWindowSize } = useWindowSize(id);
  const [dosInstance, setDosInstance] = useState<DosInstance>();
  const loadingInstanceRef = useRef(false);
  const { foregroundId } = useSession();
  const dosCI = useDosCI(id, url, containerRef, dosInstance);
  const { closeWithTransition, processes: { [id]: { libs = [] } = {} } = {} } =
    useProcesses();

  useEffect(() => {
    if (!dosInstance && !loadingInstanceRef.current) {
      loadingInstanceRef.current = true;

      loadFiles(libs).then(() => {
        if (!window.emulators) return;

        window.emulators.pathPrefix = pathPrefix;

        if (containerRef.current) {
          const baseContainer = containerRef.current.closest("section");

          baseContainer?.addEventListener("keydown", captureKeys, {
            capture: true,
          });
          baseContainer?.addEventListener("keyup", captureKeys, {
            capture: true,
          });
          baseContainer?.addEventListener(
            "focus",
            () => containerRef.current?.focus(PREVENT_SCROLL),
            { passive: true }
          );

          setDosInstance(window.Dos(containerRef.current, dosOptions));
        }
      });
    }
  }, [containerRef, dosInstance, libs]);

  useEffect(() => {
    if (dosCI && loading) {
      updateWindowSize(dosCI.height(), dosCI.width());

      const events = dosCI.events();

      events.onMessage((_msgType: string, eventType: string) => {
        if (eventType.startsWith("[LOG_EXEC]")) {
          const [, message] = eventType.split("[LOG_EXEC]");
          const [dosCommand] = message
            .replace("Parsing command line: ", "")
            .split(" ");

          if (dosCommand.toUpperCase() === "EXIT") {
            closeWithTransition(id);
          }
        }
      });
      events.onFrameSize(() => {
        const canvas = containerRef.current?.querySelector("canvas");
        const [width, height] = [
          pxToNum(canvas?.style.width),
          pxToNum(canvas?.style.height),
        ];
        const { height: currentHeight = 0, width: currentWidth = 0 } =
          canvas?.getBoundingClientRect() || {};

        if (
          height &&
          width &&
          (height !== currentHeight || width !== currentWidth)
        ) {
          updateWindowSize(height, width);
        }
      });
      events.onExit(() =>
        window.SimpleKeyboardInstances?.emulatorKeyboard?.destroy()
      );

      setLoading(false);
    }
  }, [
    closeWithTransition,
    containerRef,
    dosCI,
    dosInstance?.layers,
    id,
    loading,
    setLoading,
    updateWindowSize,
  ]);

  useLayoutEffect(() => {
    if (id === foregroundId && !loading) {
      containerRef.current?.focus(PREVENT_SCROLL);
    }
  }, [containerRef, loading, foregroundId, id]);
};

export default useJSDOS;
