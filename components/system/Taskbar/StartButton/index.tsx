import StartButtonIcon from "components/system/Taskbar/StartButton/StartButtonIcon";
import StyledStartButton from "components/system/Taskbar/StartButton/StyledStartButton";
import useTaskbarContextMenu from "components/system/Taskbar/useTaskbarContextMenu";
import { label } from "utils/functions";

type StartButtonProps = {
  startMenuVisible: boolean;
  toggleStartMenu: (showMenu?: boolean) => void;
};

const StartButton: FC<StartButtonProps> = ({
  startMenuVisible,
  toggleStartMenu,
}) => (
  <StyledStartButton
    $active={startMenuVisible}
    onClick={() => toggleStartMenu()}
    {...label("Start")}
    {...useTaskbarContextMenu(true)}
  >
    <StartButtonIcon />
  </StyledStartButton>
);

export default StartButton;
