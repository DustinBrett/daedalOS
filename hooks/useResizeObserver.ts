import { useEffect } from "react";

const useResizeObserver = (
  target?: HTMLElement | null | React.RefObject<HTMLElement | null>,
  callback?: ResizeObserverCallback
): void => {
  useEffect(() => {
    const element = target && "current" in target ? target.current : target;
    const resizeObserver =
      callback && element instanceof HTMLElement
        ? new ResizeObserver(callback)
        : undefined;

    if (element) resizeObserver?.observe(element);

    return () => resizeObserver?.disconnect();
  }, [callback, target]);
};

export default useResizeObserver;
