import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { useCallback, useLayoutEffect } from "react";
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
  callbackEvents?: Partial<Events>
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
  const { closing, componentWindow, minimized, taskbarEntry, url } =
    process || {};
  const zIndex =
    stackOrder.length + (minimized ? 1 : -stackOrder.indexOf(id)) + 1;
  const isForeground = id === foregroundId;
  const onBlurCapture: React.FocusEventHandler<HTMLElement> = (event) => {
    const { relatedTarget } = event;
    const focusedElement = relatedTarget as HTMLElement | null;
    const focusedOnTaskbarEntry = relatedTarget === taskbarEntry;
    const focusedOnTaskbarPeek =
      focusedElement && taskbarEntry?.previousSibling?.contains(focusedElement);
    const focusedOnInsideWindow =
      focusedElement && componentWindow?.contains(focusedElement);

    if (
      isForeground &&
      !focusedOnTaskbarEntry &&
      !focusedOnTaskbarPeek &&
      !focusedOnInsideWindow
    ) {
      setForegroundId("");
      callbackEvents?.onBlurCapture?.(event);
    }

    if (isForeground && focusedOnTaskbarPeek) {
      componentWindow?.focus(PREVENT_SCROLL);
    }
  };
  const moveToFront = useCallback(
    (event?: React.FocusEvent<HTMLElement> | React.MouseEvent<HTMLElement>) => {
      const { relatedTarget } = event || {};

      if (componentWindow?.contains(document.activeElement)) {
        prependToStack(id);
        setForegroundId(id);
      } else if (!relatedTarget || document.activeElement === taskbarEntry) {
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
    if (isForeground) moveToFront();
  }, [isForeground, moveToFront]);

  useLayoutEffect(() => {
    if (componentWindow && !closing && !minimized) {
      setForegroundId(id);
    }
  }, [closing, componentWindow, id, minimized, setForegroundId, url]);

  return {
    onBlurCapture,
    onClickCapture: moveToFront,
    onFocusCapture: moveToFront,
    zIndex,
    ...FOCUSABLE_ELEMENT,
  };
};

export default useFocusable;
