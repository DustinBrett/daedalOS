import { useRef, useState, useEffect } from "react";
import { DEFAULT_INTERSECTION_OPTIONS } from "utils/constants";

export const useIsVisible = (
  elementRef: React.RefObject<HTMLElement | null>,
  parentSelector?: string | React.RefObject<HTMLElement | null>,
  alwaysVisible = false
): boolean => {
  const watching = useRef(false);
  const [isVisible, setIsVisible] = useState(alwaysVisible);

  useEffect(() => {
    if (alwaysVisible || !elementRef.current || watching.current) return;

    watching.current = true;

    new IntersectionObserver(
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
    ).observe(elementRef.current);
  }, [alwaysVisible, elementRef, parentSelector]);

  return isVisible;
};
