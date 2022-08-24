import { useCallback, useEffect } from "react";
import { haltEvent } from "utils/functions";

const useGlobalErrorHandler = (): void => {
  const errorHandler = useCallback((event: Event & { error: Error }) => {
    if (event.error?.stack?.includes("eval at <anonymous>")) {
      haltEvent(event);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("error", errorHandler);

    return () => window.removeEventListener("error", errorHandler);
  }, [errorHandler]);
};

export default useGlobalErrorHandler;
