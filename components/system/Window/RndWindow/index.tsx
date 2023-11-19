import { Rnd } from "react-rnd";
import { useCallback, useEffect, useMemo, useRef } from "react";
import useRnd from "components/system/Window/RndWindow/useRnd";
import { useProcesses } from "contexts/process";
import { FOCUSABLE_ELEMENT, PREVENT_SCROLL } from "utils/constants";
import { haltEvent } from "utils/functions";

type RndWindowProps = {
  id: string;
  zIndex: number;
};

const reRouteFocus =
  (focusElement?: HTMLElement) =>
  (element?: Element): void => {
    element?.setAttribute("tabindex", FOCUSABLE_ELEMENT.tabIndex.toString());
    element?.addEventListener("contextmenu", haltEvent);
    element?.addEventListener("mousedown", (event) => {
      event.preventDefault();
      focusElement?.focus(PREVENT_SCROLL);
    });
  };

const RndWindow: FC<RndWindowProps> = ({ children, id, zIndex }) => {
  const {
    linkElement,
    processes: { [id]: process },
  } = useProcesses();
  const { Component, componentWindow, maximized, minimized } = process || {};
  const rndRef = useRef<Rnd | null>(null);
  const rndProps = useRnd(id);
  const style = useMemo<React.CSSProperties>(
    () => ({
      pointerEvents: minimized ? "none" : undefined,
      zIndex,
    }),
    [minimized, zIndex]
  );
  const linkComponentWindow = useCallback(
    (rndEntry: Rnd) => {
      rndRef.current = rndEntry;

      const rndWindowElements =
        rndEntry?.resizableElement?.current?.children || [];
      const [windowContainer] = rndWindowElements as HTMLElement[];

      if (Component && !componentWindow && windowContainer) {
        linkElement(id, "componentWindow", windowContainer);
      }
    },
    [Component, componentWindow, id, linkElement]
  );

  useEffect(() => {
    if (!maximized) {
      const { current: currentWindow } = rndRef;
      const rndWindowElements =
        currentWindow?.resizableElement?.current?.children || [];
      const [windowContainer, resizeHandleContainer] =
        rndWindowElements as HTMLElement[];
      const resizeHandles = [...(resizeHandleContainer?.children || [])];

      resizeHandles.forEach(reRouteFocus(windowContainer));
    }
  }, [maximized]);

  return (
    <Rnd ref={linkComponentWindow} style={style} {...rndProps}>
      {children}
    </Rnd>
  );
};

export default RndWindow;
