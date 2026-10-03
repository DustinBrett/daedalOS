import { memo, useCallback } from "react";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import StyledPeekViewport from "components/system/Taskbar/TaskbarEntry/Peek/StyledPeekViewport";
import RndWindow from "components/system/Window/RndWindow";
import useRnd from "components/system/Window/RndWindow/useRnd";
import StyledWindow from "components/system/Window/StyledWindow";
import Titlebar from "components/system/Window/Titlebar";
import useFocusable from "components/system/Window/useFocusable";
import useWindowTransitions from "components/system/Window/useWindowTransitions";
import { useProcess, useProcessesActions } from "contexts/process";
import { useForegroundId } from "contexts/session";

const Window: FC<ComponentProcessProps> = ({ children, id }) => {
  const { linkElement } = useProcessesActions();
  const {
    backgroundBlur,
    backgroundColor,
    Component,
    hideTitlebar,
    minimized,
    peekElement,
    title,
  } = useProcess(id);
  const foregroundId = useForegroundId();
  const isForeground = id === foregroundId;
  const { zIndex, ...focusableProps } = useFocusable(id);
  const rndProps = useRnd(id);
  const windowTransitions = useWindowTransitions(id, rndProps.position);
  const linkViewportEntry = useCallback(
    (viewportEntry: HTMLDivElement) => {
      if (Component && !peekElement && viewportEntry) {
        linkElement(id, "peekElement", viewportEntry);
      }
    },
    [Component, id, linkElement, peekElement]
  );

  return (
    <RndWindow id={id} rndProps={rndProps} zIndex={zIndex}>
      <StyledWindow
        $backgroundBlur={backgroundBlur}
        $backgroundColor={backgroundColor}
        $isForeground={isForeground}
        aria-hidden={minimized || undefined}
        aria-label={title}
        inert={minimized || undefined}
        role="dialog"
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

export default memo(Window);
