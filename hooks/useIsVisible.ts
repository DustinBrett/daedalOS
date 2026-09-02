import { useState, useEffect } from "react";
import { DEFAULT_INTERSECTION_OPTIONS } from "utils/constants";

export const useIsVisible = (
  elementRef: React.RefObject<HTMLElement | null>,
  parentSelector?: string | React.RefObject<HTMLElement | null>,
  alwaysVisible = false
): boolean => {
  const [isVisible, setIsVisible] = useState(alwaysVisible);

  useEffect(() => {
    let observer: IntersectionObserver;

    if (!alwaysVisible && elementRef.current) {
      observer = new IntersectionObserver(
        (entries) =>
          entries.forEach(({ isIntersecting }) => setIsVisible(isIntersecting)),
        {
          root:
            (typeof parentSelector === "object" && parentSelector.current) ||
            (typeof parentSelector === "string" &&
              elementRef.current.closest(parentSelector)) ||
            elementRef.current.parentElement,
          ...DEFAULT_INTERSECTION_OPTIONS,
        }
      );

      observer.observe(elementRef.current);
    }

    return () => observer?.disconnect();
  }, [alwaysVisible, elementRef, parentSelector]);

  return isVisible;
};
