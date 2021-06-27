import StyledStartButton from "components/system/Taskbar/StartButton/StyledStartButton";
import WindowsIcon from "components/system/Taskbar/StartButton/WindowsIcon";
import { useSession } from "contexts/session";

const StartButton = (): JSX.Element => {
  const { startMenuVisible, toggleStartMenu } = useSession();

  return (
    <StyledStartButton
      active={startMenuVisible}
      title="Start"
      onClick={() => toggleStartMenu()}
    >
      <WindowsIcon />
    </StyledStartButton>
  );
};

export default StartButton;
