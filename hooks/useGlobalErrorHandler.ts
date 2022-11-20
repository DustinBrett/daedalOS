import { useEffect } from "react";
import { haltEvent } from "utils/functions";

const useGlobalErrorHandler = (): void => {
  useEffect(() => {
    const errorHandler = (event: Event & { error: Error }): void => {
      if (event.error?.stack?.includes("eval at <anonymous>")) {
        haltEvent(event);
      }
    };

    window.addEventListener("error", errorHandler);

    return () => window.removeEventListener("error", errorHandler);
  }, []);
};

export default useGlobalErrorHandler;
