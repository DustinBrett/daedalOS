import useRnd from "components/system/Window/RndWindow/useRnd";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import {
  FOCUSABLE_ELEMENT,
  PREVENT_SCROLL,
  TRANSITIONS_IN_MILLISECONDS,
} from "utils/constants";
import { pxToNum } from "utils/functions";

type RndWindowProps = {
  children: React.ReactNode;
  id: string;
  zIndex: number;
};

const reRouteFocus =
  (focusElement?: HTMLElement) =>
  (element?: Element): void => {
    element?.setAttribute("tabindex", FOCUSABLE_ELEMENT.tabIndex.toString());
    element?.addEventListener("contextmenu", (event) => event.preventDefault());
    element?.addEventListener("mousedown", (event) => {
      event.preventDefault();
      focusElement?.focus(PREVENT_SCROLL);
    });
  };

const RndWindow = ({ children, id, zIndex }: RndWindowProps): JSX.Element => {
  const {
    linkElement,
    maximize,
    processes: { [id]: process },
  } = useProcesses();
  const { closing, componentWindow, maximized, minimized } = process || {};
  const rndRef = useRef<Rnd | null>(null);
  const rndProps = useRnd(id, maximized);
  const { setWindowStates, windowStates: { [id]: windowState } = {} } =
    useSession();
  const { maximized: wasMaximized } = windowState || {};
  const [openedMaximized, setOpenedMaximized] = useState(false);

  useEffect(() => {
    if (wasMaximized && !openedMaximized && process) {
      setTimeout(() => maximize(id), TRANSITIONS_IN_MILLISECONDS.WINDOW * 1.25);
      setOpenedMaximized(true);
    }
  }, [id, maximize, openedMaximized, process, wasMaximized]);

  useEffect(() => {
    const { current: currentWindow } = rndRef;
    const rndWindowElements =
      currentWindow?.resizableElement?.current?.children || [];
    const [windowContainer, resizeHandleContainer] =
      rndWindowElements as HTMLElement[];
    const resizeHandles = [...(resizeHandleContainer?.children || [])];

    resizeHandles.forEach(reRouteFocus(windowContainer));

    if (process && !componentWindow && windowContainer) {
      linkElement(id, "componentWindow", windowContainer);
    }

    return () => {
      if (closing) {
        setWindowStates((currentWindowStates) => ({
          ...currentWindowStates,
          [id]: {
            maximized,
            position: currentWindow?.props.position,
            size: currentWindow?.props.size
              ? {
                  height: pxToNum(currentWindow?.props.size.height),
                  width: pxToNum(currentWindow?.props.size.width),
                }
              : undefined,
          },
        }));
      }
    };
  }, [
    closing,
    componentWindow,
    id,
    linkElement,
    maximized,
    process,
    setWindowStates,
  ]);

  return (
    <Rnd
      ref={rndRef}
      style={{
        pointerEvents: minimized ? "none" : undefined,
        zIndex,
      }}
      {...rndProps}
    >
      {children}
    </Rnd>
  );
};

export default RndWindow;
