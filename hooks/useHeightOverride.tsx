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
      /android/i.test(navigator.userAgent) &&
      /chrome/i.test(navigator.userAgent)
    ) {
      requestAnimationFrame(() => {
        if (
          window.initialHeight !== window.innerHeight &&
          window.innerHeight === window.outerHeight &&
          window.innerHeight > window.screen.availHeight
        ) {
          setHeight(window.initialHeight || 0);

          const resetHeight = (): void => setHeight(0);

          window.addEventListener(
            "resize",
            resetHeight,
            ONE_TIME_PASSIVE_EVENT
          );
          window.screen.orientation?.addEventListener(
            "change",
            resetHeight,
            ONE_TIME_PASSIVE_EVENT
          );
        }
      });
    }
  }, []);

  return height;
};

export default useHeightOverride;
