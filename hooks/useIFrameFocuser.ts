import { useProcesses } from "contexts/process";
import type { Processes } from "contexts/process/types";
import { useSession } from "contexts/session";
import { useEffect, useRef } from "react";
import { ONE_TIME_PASSIVE_EVENT } from "utils/constants";

const useIFrameFocuser = (): void => {
  const { processes } = useProcesses();
  const { setForegroundId } = useSession();
  const processesRef = useRef<Processes>({});

  useEffect(() => {
    const focusIframeWindow = (): void => {
      if (document.activeElement instanceof HTMLIFrameElement) {
        const [id] =
          Object.entries(processes).find(([, { componentWindow }]) =>
            componentWindow?.contains(document.activeElement)
          ) || [];

        if (id) {
          setForegroundId(id);
          window.addEventListener(
            "click",
            ({ target }) => {
              const [focusId = ""] =
                Object.entries(processesRef.current).find(
                  ([, { componentWindow }]) =>
                    target instanceof HTMLElement &&
                    componentWindow?.contains(target)
                ) || [];

              setForegroundId(focusId);
            },
            ONE_TIME_PASSIVE_EVENT
          );
        }
      }
    };

    window.addEventListener("blur", focusIframeWindow, { passive: true });

    return () => window.removeEventListener("blur", focusIframeWindow);
  }, [processes, setForegroundId]);

  useEffect(() => {
    processesRef.current = processes;
  }, [processes]);
};

export default useIFrameFocuser;
