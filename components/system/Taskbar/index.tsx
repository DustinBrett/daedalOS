import { memo, useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import Clock from "components/system/Taskbar/Clock";
import SearchButton from "components/system/Taskbar/Search/SearchButton";
import StartButton from "components/system/Taskbar/StartButton";
import StyledTaskbar from "components/system/Taskbar/StyledTaskbar";
import TaskbarEntries from "components/system/Taskbar/TaskbarEntries";
import useTaskbarContextMenu from "components/system/Taskbar/useTaskbarContextMenu";
import { CLOCK_CANVAS_BASE_WIDTH, FOCUSABLE_ELEMENT } from "utils/constants";

const Calendar = dynamic(() => import("components/system/Taskbar/Calendar"));
const Search = dynamic(() => import("components/system/Taskbar/Search"));
const StartMenu = dynamic(() => import("components/system/StartMenu"));

const Taskbar: FC = () => {
  const [startMenuVisible, setStartMenuVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [clockWidth, setClockWidth] = useState(CLOCK_CANVAS_BASE_WIDTH);
  const toggleStartMenu = useCallback(
    (showMenu?: boolean): void =>
      setStartMenuVisible((currentMenuState) => showMenu ?? !currentMenuState),
    []
  );
  const toggleSearch = useCallback(
    (showSearch?: boolean): void =>
      setSearchVisible(
        (currentSearchState) => showSearch ?? !currentSearchState
      ),
    []
  );
  const toggleCalendar = useCallback(
    (showCalendar?: boolean): void =>
      setCalendarVisible(
        (currentCalendarState) => showCalendar ?? !currentCalendarState
      ),
    []
  );

  return (
    <>
      <AnimatePresence initial={false} presenceAffectsLayout={false}>
        {startMenuVisible && (
          <StartMenu key="startMenu" toggleStartMenu={toggleStartMenu} />
        )}
        {searchVisible && <Search key="search" toggleSearch={toggleSearch} />}
      </AnimatePresence>
      <StyledTaskbar {...useTaskbarContextMenu()} {...FOCUSABLE_ELEMENT}>
        <StartButton
          startMenuVisible={startMenuVisible}
          toggleStartMenu={toggleStartMenu}
        />
        <SearchButton
          searchVisible={searchVisible}
          toggleSearch={toggleSearch}
        />
        <TaskbarEntries clockWidth={clockWidth} />
        <Clock
          setClockWidth={setClockWidth}
          toggleCalendar={toggleCalendar}
          width={clockWidth}
        />
      </StyledTaskbar>
      <AnimatePresence initial={false} presenceAffectsLayout={false}>
        {calendarVisible && <Calendar toggleCalendar={toggleCalendar} />}
      </AnimatePresence>
    </>
  );
};

export default memo(Taskbar);
