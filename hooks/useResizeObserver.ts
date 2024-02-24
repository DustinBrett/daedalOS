import { useEffect, useState } from "react";

const useResizeObserver = (
  element?: HTMLElement | null,
  callback?: ResizeObserverCallback
): void => {
  const [resizeObserver, setResizeObserver] = useState<ResizeObserver>();

  useEffect(() => {
    if (callback) {
      setResizeObserver(new ResizeObserver(callback));
    }
  }, [callback]);

  useEffect(() => {
    if (element instanceof HTMLElement) {
      resizeObserver?.observe(element);
    }

    return () => {
      if (element instanceof HTMLElement) {
        resizeObserver?.unobserve(element);
      }
    };
  }, [element, resizeObserver]);
};

export default useResizeObserver;
