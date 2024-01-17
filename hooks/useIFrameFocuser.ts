import { useEffect } from "react";
import { useSession } from "contexts/session";
import { useProcessesRef } from "hooks/useProcessesRef";
import { ONE_TIME_PASSIVE_EVENT } from "utils/constants";

const useIFrameFocuser = (): void => {
  const { setForegroundId } = useSession();
  const processesRef = useProcessesRef();

  useEffect(() => {
    const focusIframeWindow = (): void => {
      if (document.activeElement instanceof HTMLIFrameElement) {
        const [id] =
          Object.entries(processesRef.current).find(([, { componentWindow }]) =>
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
  }, [processesRef, setForegroundId]);
};

export default useIFrameFocuser;
