import useRnd from "components/system/Window/RndWindow/useRnd";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { useEffect, useRef } from "react";
import { Rnd } from "react-rnd";

type RndWindowProps = {
  children: React.ReactNode;
  id: string;
  zIndex: number;
};

const reRouteFocus =
  (focusElement?: HTMLElement) =>
  (element?: Element): void => {
    element?.setAttribute("tabindex", "-1");
    element?.addEventListener("mousedown", (event) => {
      event.preventDefault();
      focusElement?.focus();
    });
  };

const RndWindow = ({ children, id, zIndex }: RndWindowProps): JSX.Element => {
  const {
    linkElement,
    processes: { [id]: process },
  } = useProcesses();
  const { componentWindow, maximized, minimized } = process || {};
  const rndRef = useRef<Rnd | null>(null);
  const rndProps = useRnd(id, maximized);
  const { setWindowStates } = useSession();

  useEffect(() => {
    const { current: currentWindow } = rndRef || {};
    const rndWindowElements =
      currentWindow?.resizableElement?.current?.children || [];
    const [windowContainer, resizeHandleContainer] =
      rndWindowElements as HTMLElement[];
    const resizeHandles = [...resizeHandleContainer?.children];

    resizeHandles.forEach(reRouteFocus(windowContainer));

    if (process && !componentWindow && windowContainer) {
      linkElement(id, "componentWindow", windowContainer);
    }

    return () =>
      setWindowStates((currentWindowStates) => ({
        ...currentWindowStates,
        [id]: {
          position: currentWindow?.props?.position,
          size: currentWindow?.props?.size,
        },
      }));
  }, [componentWindow, id, linkElement, maximized, process, setWindowStates]);

  return (
    <Rnd
      ref={rndRef}
      style={{
        pointerEvents: minimized ? "none" : "all",
        zIndex,
      }}
      {...rndProps}
    >
      {children}
    </Rnd>
  );
};

export default RndWindow;
