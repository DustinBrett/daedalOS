import { useRef, useState, useEffect } from "react";
import { DEFAULT_INTERSECTION_OPTIONS } from "utils/constants";

export const useIsVisible = (
  elementRef: React.MutableRefObject<HTMLElement | null>,
  parentSelector?: string | React.MutableRefObject<HTMLElement | null>,
  alwaysVisible = false
): boolean => {
  const watching = useRef(false);
  const [isVisible, setIsVisible] = useState(alwaysVisible);
  const observerRef = useRef<IntersectionObserver>();

  useEffect(() => {
    if (alwaysVisible || !elementRef.current || watching.current) return;

    watching.current = true;
    observerRef.current = new IntersectionObserver(
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

    observerRef.current.observe(elementRef.current);
  }, [alwaysVisible, elementRef, parentSelector]);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return isVisible;
};
