import Clock from "components/system/Taskbar/Clock";
import StartButton from "components/system/Taskbar/StartButton";
import StyledTaskbar from "components/system/Taskbar/StyledTaskbar";
import TaskbarEntries from "components/system/Taskbar/TaskbarEntries";
import { useSession } from "contexts/session";
import dynamic from "next/dynamic";

const StartMenu = dynamic(() => import("components/system/StartMenu"));

const Taskbar = (): JSX.Element => {
  const { startMenuVisible } = useSession();

  return (
    <>
      {startMenuVisible && <StartMenu />}
      <StyledTaskbar tabIndex={-1}>
        <StartButton />
        <TaskbarEntries />
        <Clock />
      </StyledTaskbar>
    </>
  );
};

export default Taskbar;
