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
  windowRef: React.MutableRefObject<HTMLElement | null>,
  callbackEvents?: Partial<Events>
): Focusable => {
  const { foregroundId, prependToStack, setForegroundId, stackOrder } =
    useSession();
  const {
    processes: {
      [id]: { minimized = false, taskbarEntry = undefined, url = "" } = {},
    },
  } = useProcesses();
  const zIndex =
    stackOrder.length + (minimized ? 1 : -stackOrder.indexOf(id)) + 1;
  const isForeground = id === foregroundId;
  const onBlur: React.FocusEventHandler<HTMLElement> = (event) => {
    const { relatedTarget } = event;

    if (isForeground && relatedTarget !== taskbarEntry) setForegroundId("");

    callbackEvents?.onBlur?.(event);
  };
  const moveToFront = useCallback(
    (event?: React.FocusEvent<HTMLElement>) => {
      const { relatedTarget } = event || {};

      if (windowRef.current?.contains(document.activeElement)) {
        prependToStack(id);
        setForegroundId(id);
      } else if (!relatedTarget || document.activeElement === taskbarEntry) {
        windowRef.current?.focus();
        callbackEvents?.onFocus?.(event);
      }
    },
    [
      callbackEvents,
      id,
      prependToStack,
      setForegroundId,
      taskbarEntry,
      windowRef,
    ]
  );

  useEffect(() => {
    if (isForeground) moveToFront();
  }, [isForeground, moveToFront]);

  useEffect(() => setForegroundId(id), [id, setForegroundId, url]);

  return {
    onBlur,
    onFocus: moveToFront,
    tabIndex: -1,
    zIndex,
  };
};

export default useFocusable;
