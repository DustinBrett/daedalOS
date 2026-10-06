import { useEffect, useLayoutEffect } from "react";
import { useProcess } from "contexts/process";
import {
  useForegroundId,
  useSessionActions,
  useStackOrder,
} from "contexts/session";
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
  const { prependToStack, removeFromStack, setForegroundId } =
    useSessionActions();
  const foregroundId = useForegroundId();
  const stackOrder = useStackOrder();
  const {
    closing = false,
    componentWindow = focusElement,
    minimized = false,
    taskbarEntry,
    url,
  } = useProcess(id);
  const zIndex =
    stackOrder.length + (minimized ? 1 : -stackOrder.indexOf(id)) + 1;
  const onBlurCapture: React.FocusEventHandler<HTMLElement> = (event) => {
    const { relatedTarget } = event;
    const focusedElement = relatedTarget as HTMLElement | null;
    const focusedOnTaskbarEntry =
      (relatedTarget as HTMLElement) === taskbarEntry;
    const focusedOnTaskbarPeek =
      focusedElement && taskbarEntry?.previousSibling?.contains(focusedElement);
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
  };
  const moveToFront = (
    event?: React.FocusEvent<HTMLElement> | React.MouseEvent<HTMLElement>
  ): void => {
    const { relatedTarget } = event || {};

    if (componentWindow?.contains(document.activeElement)) {
      prependToStack(id);
      setForegroundId(id);
    } else if (
      !relatedTarget ||
      (document.activeElement as HTMLElement) === taskbarEntry
    ) {
      componentWindow?.focus(PREVENT_SCROLL);
      callbackEvents?.onFocusCapture?.(event as React.FocusEvent<HTMLElement>);
    }
  };

  useLayoutEffect(() => {
    if (id === foregroundId) moveToFront();
  }, [foregroundId, id, moveToFront]);

  useLayoutEffect(() => {
    if (componentWindow && !closing && !minimized) {
      setForegroundId(id);
    }
    // eslint-disable-next-line react/exhaustive-effect-dependencies
  }, [closing, componentWindow, id, minimized, setForegroundId, url]);

  useEffect(() => () => removeFromStack(id), [id, removeFromStack]);

  return {
    onBlurCapture,
    onClickCapture: moveToFront,
    onFocusCapture: moveToFront,
    zIndex,
    ...FOCUSABLE_ELEMENT,
  };
};

export default useFocusable;
