import StyledPeekWindow from "components/system/Taskbar/TaskbarEntry/Peek/StyledPeekWindow";
import useWindowActions from "components/system/Window/Titlebar/useWindowActions";
import { CloseIcon } from "components/system/Window/Titlebar/WindowActionIcons";
import { useProcesses } from "contexts/process";
import Button from "styles/common/Button";

type PeekWindowProps = {
  id: string;
  image: string;
};

const PeekWindow = ({ id, image }: PeekWindowProps): JSX.Element => {
  const {
    processes: { [id]: { title = id } = {} },
  } = useProcesses();
  const { onClose } = useWindowActions(id);

  return (
    <StyledPeekWindow>
      <img alt={title} src={image} />
      <Button onClick={onClose} title="Close">
        <CloseIcon />
      </Button>
    </StyledPeekWindow>
  );
};

export default PeekWindow;
