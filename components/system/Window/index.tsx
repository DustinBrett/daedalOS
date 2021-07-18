import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import StyledPeekViewport from "components/system/Taskbar/TaskbarEntry/Peek/StyledPeekViewport";
import RndWindow from "components/system/Window/RndWindow";
import StyledWindow from "components/system/Window/StyledWindow";
import Titlebar from "components/system/Window/Titlebar";
import useFocusable from "components/system/Window/useFocusable";
import useWindowTransitions from "components/system/Window/useWindowTransitions";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { useEffect, useRef } from "react";

type WindowProps = ComponentProcessProps & {
  children: React.ReactNode;
};

const Window = ({ children, id }: WindowProps): JSX.Element => {
  const {
    linkElement,
    processes: { [id]: process },
  } = useProcesses();
  const { backgroundColor, peekElement } = process || {};
  const { foregroundId } = useSession();
  const isForeground = id === foregroundId;
  const { zIndex, ...focusableProps } = useFocusable(id);
  const windowTransitions = useWindowTransitions(id);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (process && !peekElement && viewportRef.current) {
      linkElement(id, "peekElement", viewportRef.current);
    }
  }, [id, linkElement, peekElement, process]);

  return (
    <RndWindow id={id} zIndex={zIndex}>
      <StyledWindow
        foreground={isForeground}
        style={{ backgroundColor }}
        {...focusableProps}
        {...windowTransitions}
      >
        <StyledPeekViewport ref={viewportRef}>
          <Titlebar id={id} />
          {children}
        </StyledPeekViewport>
      </StyledWindow>
    </RndWindow>
  );
};

export default Window;
