import Clock from "components/system/Taskbar/Clock";
import StartButton from "components/system/Taskbar/StartButton";
import StyledTaskbar from "components/system/Taskbar/StyledTaskbar";
import TaskbarEntries from "components/system/Taskbar/TaskbarEntries";
import useTaskbarContextMenu from "components/system/Taskbar/useTaskbarContextMenu";
import dynamic from "next/dynamic";
import { useState } from "react";
import { FOCUSABLE_ELEMENT } from "utils/constants";

const StartMenu = dynamic(() => import("components/system/StartMenu"));

const Taskbar: FC = () => {
  const [startMenuVisible, setStartMenuVisible] = useState(false);
  const toggleStartMenu = (showMenu?: boolean): void =>
    setStartMenuVisible((currentMenuState) => showMenu ?? !currentMenuState);

  return (
    <>
      {startMenuVisible && <StartMenu toggleStartMenu={toggleStartMenu} />}
      <StyledTaskbar {...useTaskbarContextMenu()} {...FOCUSABLE_ELEMENT}>
        <StartButton
          startMenuVisible={startMenuVisible}
          toggleStartMenu={toggleStartMenu}
        />
        <TaskbarEntries />
        <Clock />
      </StyledTaskbar>
    </>
  );
};

export default Taskbar;
