import useRnd from "components/system/Window/RndWindow/useRnd";
import { useProcesses } from "contexts/process";
import { useLayoutEffect, useMemo, useRef } from "react";
import { Rnd } from "react-rnd";
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
  const { minimized } = process || {};
  const linkedWindowRef = useRef(false);
  const rndRef = useRef<Rnd | null>(null);
  const rndProps = useRnd(id);
  const style = useMemo<React.CSSProperties>(
    () => ({
      pointerEvents: minimized ? "none" : undefined,
      zIndex,
    }),
    [minimized, zIndex]
  );

  useLayoutEffect(() => {
    const { current: currentWindow } = rndRef;
    const rndWindowElements =
      currentWindow?.resizableElement?.current?.children || [];
    const [windowContainer, resizeHandleContainer] =
      rndWindowElements as HTMLElement[];
    const resizeHandles = [...(resizeHandleContainer?.children || [])];

    resizeHandles.forEach(reRouteFocus(windowContainer));

    if (!linkedWindowRef.current && process && windowContainer) {
      linkedWindowRef.current = true;
      linkElement(id, "componentWindow", windowContainer);
    }
  }, [id, linkElement, process]);

  return (
    <Rnd ref={rndRef} style={style} {...rndProps}>
      {children}
    </Rnd>
  );
};

export default RndWindow;
