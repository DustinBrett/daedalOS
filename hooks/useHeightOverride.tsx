import { useEffect, useState } from "react";
import { ONE_TIME_PASSIVE_EVENT } from "utils/constants";

declare global {
  interface Window {
    initialHeight?: number;
  }
}

const useHeightOverride = (): number => {
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      typeof window.initialHeight === "number" &&
      window.initialHeight > 0 &&
      window.initialHeight !== document.documentElement.clientHeight &&
      document.documentElement.clientHeight > window.screen.height &&
      /android|iphone/i.test(navigator.userAgent)
    ) {
      setHeight(window.initialHeight);

      const resetHeight = (): void => setHeight(0);

      window.addEventListener("resize", resetHeight, ONE_TIME_PASSIVE_EVENT);
      window.screen.orientation?.addEventListener(
        "change",
        resetHeight,
        ONE_TIME_PASSIVE_EVENT
      );
    }
  }, []);

  return height;
};

export default useHeightOverride;
