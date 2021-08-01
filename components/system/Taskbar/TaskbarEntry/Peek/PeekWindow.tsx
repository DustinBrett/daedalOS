import StyledPeekWindow from "components/system/Taskbar/TaskbarEntry/Peek/StyledPeekWindow";
import usePeekTransition from "components/system/Taskbar/TaskbarEntry/Peek/usePeekTransition";
import useWindowPeek from "components/system/Taskbar/TaskbarEntry/Peek/useWindowPeek";
import useWindowActions from "components/system/Window/Titlebar/useWindowActions";
import { CloseIcon } from "components/system/Window/Titlebar/WindowActionIcons";
import { useProcesses } from "contexts/process";
import Button from "styles/common/Button";

type PeekWindowProps = {
  id: string;
};

const PeekWindow = ({ id }: PeekWindowProps): JSX.Element => {
  const {
    processes: { [id]: { title = id } = {} },
  } = useProcesses();
  const { onClose } = useWindowActions(id);
  const image = useWindowPeek(id);
  const peekTransition = usePeekTransition();

  return image ? (
    <StyledPeekWindow {...peekTransition}>
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
