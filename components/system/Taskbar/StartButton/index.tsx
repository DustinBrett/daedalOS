import { SideMenu } from "components/system/StartMenu/Sidebar/SidebarIcons";
import StyledStartButton from "components/system/Taskbar/StartButton/StyledStartButton";

type StartButtonProps = {
  startMenuVisible: boolean;
  toggleStartMenu: (showMenu?: boolean) => void;
};

const StartButton = ({
  startMenuVisible,
  toggleStartMenu,
}: StartButtonProps): JSX.Element => (
  <StyledStartButton
    $active={startMenuVisible}
    onClick={() => toggleStartMenu()}
    title="Start"
  >
    <SideMenu />
  </StyledStartButton>
);

export default StartButton;
