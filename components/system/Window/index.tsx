import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import RndWindow from "components/system/Window/RndWindow";
import StyledWindow from "components/system/Window/StyledWindow";
import Titlebar from "components/system/Window/Titlebar";
import useFocusable from "components/system/Window/useFocusable";
import useWindowTransitions from "components/system/Window/useWindowTransitions";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";

type WindowProps = ComponentProcessProps & {
  children: React.ReactNode;
};

const Window = ({ children, id }: WindowProps): JSX.Element => {
  const {
    processes: { [id]: { backgroundColor = "" } = {} },
  } = useProcesses();
  const { foregroundId } = useSession();
  const isForeground = id === foregroundId;
  const { zIndex, ...focusableProps } = useFocusable(id);
  const windowTransitions = useWindowTransitions(id);

  return (
    <RndWindow id={id} zIndex={zIndex}>
      <StyledWindow
        foreground={isForeground}
        style={{ backgroundColor }}
        {...focusableProps}
        {...windowTransitions}
      >
        <Titlebar id={id} />
        {children}
      </StyledWindow>
    </RndWindow>
  );
};

export default Window;
