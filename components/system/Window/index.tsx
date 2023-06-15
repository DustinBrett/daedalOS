import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import StyledPeekViewport from "components/system/Taskbar/TaskbarEntry/Peek/StyledPeekViewport";
import RndWindow from "components/system/Window/RndWindow";
import StyledWindow from "components/system/Window/StyledWindow";
import Titlebar from "components/system/Window/Titlebar";
import useFocusable from "components/system/Window/useFocusable";
import useWindowTransitions from "components/system/Window/useWindowTransitions";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { useCallback } from "react";

const Window: FC<ComponentProcessProps> = ({ children, id }) => {
  const {
    linkElement,
    processes: { [id]: process },
  } = useProcesses();
  const { backgroundColor, Component, hideTitlebar, peekElement } =
    process || {};
  const { foregroundId } = useSession();
  const isForeground = id === foregroundId;
  const { zIndex, ...focusableProps } = useFocusable(id);
  const windowTransitions = useWindowTransitions(id);
  const linkViewportEntry = useCallback(
    (viewportEntry: HTMLDivElement) =>
      Component &&
      !peekElement &&
      viewportEntry &&
      linkElement(id, "peekElement", viewportEntry),
    [Component, id, linkElement, peekElement]
  );

  return (
    <RndWindow id={id} zIndex={zIndex}>
      <StyledWindow
        $backgroundColor={backgroundColor}
        $isForeground={isForeground}
        {...focusableProps}
        {...windowTransitions}
      >
        <StyledPeekViewport ref={linkViewportEntry}>
          {!hideTitlebar && <Titlebar id={id} />}
          {children}
        </StyledPeekViewport>
      </StyledWindow>
    </RndWindow>
  );
};

export default Window;
