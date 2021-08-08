import StyledPeekWindow from "components/system/Taskbar/TaskbarEntry/Peek/StyledPeekWindow";
import usePeekTransition from "components/system/Taskbar/TaskbarEntry/Peek/usePeekTransition";
import useWindowPeek from "components/system/Taskbar/TaskbarEntry/Peek/useWindowPeek";
import useWindowActions from "components/system/Window/Titlebar/useWindowActions";
import { CloseIcon } from "components/system/Window/Titlebar/WindowActionIcons";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import Button from "styles/common/Button";
import { FOCUSABLE_ELEMENT } from "utils/constants";

type PeekWindowProps = {
  id: string;
};

const PeekWindow = ({ id }: PeekWindowProps): JSX.Element => {
  const {
    minimize,
    processes: { [id]: { minimized = false, title = id } = {} },
  } = useProcesses();
  const { setForegroundId } = useSession();
  const { onClose } = useWindowActions(id);
  const image = useWindowPeek(id);
  const peekTransition = usePeekTransition();
  const onClick = () => {
    if (minimized) minimize(id);

    setForegroundId(id);
  };

  return image ? (
    <StyledPeekWindow
      onClick={onClick}
      {...peekTransition}
      {...FOCUSABLE_ELEMENT}
    >
      <img alt={title} src={image} />
      <Button onClick={onClose} title="Close">
        <CloseIcon />
      </Button>
    </StyledPeekWindow>
  ) : (
    <></>
  );
};

export default PeekWindow;
