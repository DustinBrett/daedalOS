import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { useCallback, useEffect } from "react";

type Events = {
  onBlur: (event: React.FocusEvent<HTMLElement>) => void;
  onFocus: (event?: React.FocusEvent<HTMLElement>) => void;
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
  const onBlur: React.FocusEventHandler<HTMLElement> = (event) => {
    const { relatedTarget } = event;
    const focusedOnTaskbarEntry = relatedTarget === taskbarEntry;
    const focusedOnInsideWindow =
      relatedTarget && componentWindow?.contains(relatedTarget as Node);

    if (isForeground && !focusedOnTaskbarEntry && !focusedOnInsideWindow) {
      setForegroundId("");
      callbackEvents?.onBlur?.(event);
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
        callbackEvents?.onFocus?.(event);
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
    onBlur,
    onFocus: moveToFront,
    tabIndex: -1,
    zIndex,
  };
};

export default useFocusable;
