import { useEffect } from "react";
import { getProcesses } from "contexts/process";
import { useSessionActions } from "contexts/session";
import { ONE_TIME_PASSIVE_EVENT } from "utils/constants";

const useIFrameFocuser = (): void => {
  const { setForegroundId } = useSessionActions();

  useEffect(() => {
    const focusIframeWindow = (): void => {
      if (document.activeElement instanceof HTMLIFrameElement) {
        const [id] =
          Object.entries(getProcesses()).find(([, { componentWindow }]) =>
            componentWindow?.contains(document.activeElement)
          ) || [];

        if (id) {
          setForegroundId(id);
          window.addEventListener(
            "click",
            ({ target }) => {
              const [focusId = ""] =
                Object.entries(getProcesses()).find(
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
  }, [setForegroundId]);
};

export default useIFrameFocuser;
