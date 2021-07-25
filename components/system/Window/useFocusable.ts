import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { useCallback, useEffect } from "react";

type Events = {
  onBlurCapture: (event: React.FocusEvent<HTMLElement>) => void;
  onFocusCapture: (event?: React.FocusEvent<HTMLElement>) => void;
};

type Focusable = Events & {
  tabIndex: number;
  zIndex: number;
};

const useFocusable = (
  id: string,
  callbackEvents?: Partial<Events>
): Focusable => {
  const { foregroundId, prependToStack, setForegroundId, stackOrder } =
    useSession();
  const {
    processes: { [id]: process },
  } = useProcesses();
  const { closing, componentWindow, minimized, taskbarEntry, url } =
    process || {};
  const zIndex =
    stackOrder.length + (minimized ? 1 : -stackOrder.indexOf(id)) + 1;
  const isForeground = id === foregroundId;
  const onBlurCapture: React.FocusEventHandler<HTMLElement> = (event) => {
    const { relatedTarget } = event;

    if (relatedTarget instanceof HTMLElement) {
      const focusedOnTaskbarEntry = relatedTarget === taskbarEntry;
      const focusedOnTaskbarPeek =
        taskbarEntry?.previousSibling?.contains(relatedTarget);
      const focusedOnInsideWindow =
        relatedTarget && componentWindow?.contains(relatedTarget);

      if (
        isForeground &&
        !focusedOnTaskbarEntry &&
        !focusedOnTaskbarPeek &&
        !focusedOnInsideWindow
      ) {
        setForegroundId("");
        callbackEvents?.onBlurCapture?.(event);
      }
    }
  };
  const moveToFront = useCallback(
    (event?: React.FocusEvent<HTMLElement>) => {
      const { relatedTarget } = event || {};

      if (componentWindow?.contains(document.activeElement)) {
        prependToStack(id);
        setForegroundId(id);
      } else if (!relatedTarget || document.activeElement === taskbarEntry) {
        componentWindow?.focus();
        callbackEvents?.onFocusCapture?.(event);
      }
    },
    [
      callbackEvents,
      componentWindow,
      id,
      prependToStack,
      setForegroundId,
      taskbarEntry,
    ]
  );

  useEffect(() => {
    if (isForeground) moveToFront();
  }, [isForeground, moveToFront]);

  useEffect(() => {
    if (process && !closing) setForegroundId(id);
  }, [closing, id, process, setForegroundId, url]);

  return {
    onBlurCapture,
    onFocusCapture: moveToFront,
    tabIndex: -1,
    zIndex,
  };
};

export default useFocusable;
