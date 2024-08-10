import { useCallback, useLayoutEffect, useMemo } from "react";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { FOCUSABLE_ELEMENT, PREVENT_SCROLL } from "utils/constants";

type Events = {
  onBlurCapture: (event: React.FocusEvent<HTMLElement>) => void;
  onClickCapture: (event?: React.MouseEvent<HTMLElement>) => void;
  onFocusCapture: (event?: React.FocusEvent<HTMLElement>) => void;
};

type Focusable = Events &
  typeof FOCUSABLE_ELEMENT & {
    zIndex: number;
  };

const useFocusable = (
  id: string,
  callbackEvents?: Partial<Events>,
  focusElement?: HTMLElement | null
): Focusable => {
  const {
    foregroundId,
    prependToStack,
    setForegroundId,
    stackOrder = [],
  } = useSession();
  const {
    processes: { [id]: process },
  } = useProcesses();
  const {
    closing = false,
    componentWindow = focusElement,
    minimized = false,
    taskbarEntry,
    url,
  } = process || {};
  const zIndex = useMemo(
    () => stackOrder.length + (minimized ? 1 : -stackOrder.indexOf(id)) + 1,
    [id, minimized, stackOrder]
  );
  const onBlurCapture: React.FocusEventHandler<HTMLElement> = useCallback(
    (event) => {
      const { relatedTarget } = event;
      const focusedElement = relatedTarget as HTMLElement | null;
      const focusedOnTaskbarEntry =
        (relatedTarget as HTMLElement) === taskbarEntry;
      const focusedOnTaskbarPeek =
        focusedElement &&
        taskbarEntry?.previousSibling?.contains(focusedElement);
      const focusedOnInsideWindow =
        focusedElement && componentWindow?.contains(focusedElement);

      setForegroundId((currentForegroundId) => {
        if (
          currentForegroundId === id &&
          !focusedOnTaskbarEntry &&
          !focusedOnInsideWindow
        ) {
          if (focusedOnTaskbarPeek) {
            componentWindow?.focus(PREVENT_SCROLL);
          } else {
            callbackEvents?.onBlurCapture?.(event);
          }

          return focusedOnTaskbarPeek ? currentForegroundId : "";
        }

        return currentForegroundId;
      });
    },
    [callbackEvents, componentWindow, id, setForegroundId, taskbarEntry]
  );
  const moveToFront = useCallback(
    (event?: React.FocusEvent<HTMLElement> | React.MouseEvent<HTMLElement>) => {
      const { relatedTarget } = event || {};

      if (componentWindow?.contains(document.activeElement)) {
        prependToStack(id);
        setForegroundId(id);
      } else if (
        !relatedTarget ||
        (document.activeElement as HTMLElement) === taskbarEntry
      ) {
        componentWindow?.focus(PREVENT_SCROLL);
        callbackEvents?.onFocusCapture?.(
          event as React.FocusEvent<HTMLElement>
        );
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

  useLayoutEffect(() => {
    if (id === foregroundId) moveToFront();
  }, [foregroundId, id, moveToFront]);

  useLayoutEffect(() => {
    if (componentWindow && !closing && !minimized) {
      setForegroundId(id);
    }
    // eslint-disable-next-line react-hooks-addons/no-unused-deps
  }, [closing, componentWindow, id, minimized, setForegroundId, url]);

  return useMemo(
    () => ({
      onBlurCapture,
      onClickCapture: moveToFront,
      onFocusCapture: moveToFront,
      zIndex,
      ...FOCUSABLE_ELEMENT,
    }),
    [moveToFront, onBlurCapture, zIndex]
  );
};

export default useFocusable;
