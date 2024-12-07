import { memo, useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "motion/react";
import Clock from "components/system/Taskbar/Clock";
import SearchButton from "components/system/Taskbar/Search/SearchButton";
import StartButton from "components/system/Taskbar/StartButton";
import StyledTaskbar from "components/system/Taskbar/StyledTaskbar";
import TaskbarEntries from "components/system/Taskbar/TaskbarEntries";
import useTaskbarContextMenu from "components/system/Taskbar/useTaskbarContextMenu";
import { CLOCK_CANVAS_BASE_WIDTH, FOCUSABLE_ELEMENT } from "utils/constants";
import { useWindowAI } from "hooks/useWindowAI";
import { useSession } from "contexts/session";

const AIButton = dynamic(() => import("components/system/Taskbar/AI/AIButton"));
const AIChat = dynamic(() => import("components/system/Taskbar/AI/AIChat"));
const Calendar = dynamic(() => import("components/system/Taskbar/Calendar"));
const Search = dynamic(() => import("components/system/Taskbar/Search"));
const StartMenu = dynamic(() => import("components/system/StartMenu"));

const Taskbar: FC = () => {
  const [startMenuVisible, setStartMenuVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [aiVisible, setAIVisible] = useState(false);
  const [clockWidth, setClockWidth] = useState(CLOCK_CANVAS_BASE_WIDTH);
  const { aiEnabled } = useSession();
  const hasWindowAI = useWindowAI();
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
  const toggleAI = useCallback(
    (showAI?: boolean): void =>
      setAIVisible((currentAIState) => showAI ?? !currentAIState),
    []
  );
  const hasAI = hasWindowAI || aiEnabled;

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
        <TaskbarEntries clockWidth={clockWidth} hasAI={hasAI} />
        <Clock
          hasAI={hasAI}
          setClockWidth={setClockWidth}
          toggleCalendar={toggleCalendar}
          width={clockWidth}
        />
        {hasAI && <AIButton aiVisible={aiVisible} toggleAI={toggleAI} />}
      </StyledTaskbar>
      <AnimatePresence initial={false} presenceAffectsLayout={false}>
        {calendarVisible && (
          <Calendar key="calendar" toggleCalendar={toggleCalendar} />
        )}
        {aiVisible && <AIChat key="aiChat" toggleAI={toggleAI} />}
      </AnimatePresence>
    </>
  );
};

export default memo(Taskbar);
