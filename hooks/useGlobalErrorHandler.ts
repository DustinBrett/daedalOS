import { useEffect } from "react";
import { haltEvent } from "utils/functions";

const errorHandler = (event: Event & { error: Error }): void => {
  if (event.error?.stack?.includes("eval at <anonymous>")) {
    haltEvent(event);
  }
};

const useGlobalErrorHandler = (): void => {
  useEffect(() => {
    window.addEventListener("error", errorHandler);

    return () => window.removeEventListener("error", errorHandler);
  }, []);
};

export default useGlobalErrorHandler;
