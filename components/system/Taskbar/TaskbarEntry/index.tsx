import { memo, useCallback, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "motion/react";
import StyledTaskbarEntry from "components/system/Taskbar/TaskbarEntry/StyledTaskbarEntry";
import useTaskbarTransition from "components/system/Taskbar/TaskbarEntry/useTaskbarTransition";
import useTitlebarContextMenu from "components/system/Window/Titlebar/useTitlebarContextMenu";
import useNextFocusable from "components/system/Window/useNextFocusable";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import Button from "styles/common/Button";
import Icon from "styles/common/Icon";
import { DIV_BUTTON_PROPS, PROCESS_DELIMITER } from "utils/constants";
import { isSafari, label } from "utils/functions";

const PeekWindow = dynamic(
  () => import("components/system/Taskbar/TaskbarEntry/Peek/PeekWindow")
);

type TaskbarEntryProps = {
  icon: string;
  id: string;
  title: string;
};

const TaskbarEntry: FC<TaskbarEntryProps> = ({ icon, id, title }) => {
  const nextFocusableId = useNextFocusable(id);
  const { foregroundId, setForegroundId } = useSession();
  const isForeground = id === foregroundId;
  const {
    linkElement,
    minimize,
    open,
    processes: { [id]: process },
  } = useProcesses();
  const { minimized, progress, singleton } = process || {};
  const linkTaskbarEntry = useCallback(
    (taskbarEntry: HTMLButtonElement | HTMLDivElement | null) => {
      if (taskbarEntry) linkElement(id, "taskbarEntry", taskbarEntry);
    },
    [id, linkElement]
  );
  const [isPeekVisible, setIsPeekVisible] = useState(false);
  const hidePeekTimerRef = useRef(0);
  const hidePeek = useCallback((): void => {
    hidePeekTimerRef.current = window.setTimeout(
      () => setIsPeekVisible(false),
      200
    );
  }, []);
  const showPeek = useCallback((): void => {
    if (hidePeekTimerRef.current) {
      window.clearTimeout(hidePeekTimerRef.current);
      hidePeekTimerRef.current = 0;
    }
    setIsPeekVisible(true);
  }, []);
  const onClick = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    (event): void => {
      if (event.shiftKey && !singleton) {
        const [pid] = id.split(PROCESS_DELIMITER);

        open(pid);
      } else {
        if (minimized || isForeground) minimize(id);

        setForegroundId(isForeground ? nextFocusableId : id);
      }
    },
    [
      id,
      isForeground,
      minimize,
      minimized,
      nextFocusableId,
      open,
      setForegroundId,
      singleton,
    ]
  );
  const focusable = useMemo(() => (isSafari() ? DIV_BUTTON_PROPS : {}), []);

  return (
    <StyledTaskbarEntry
      $foreground={isForeground}
      $progress={progress}
      onClick={hidePeek}
      onMouseEnter={showPeek}
      onMouseLeave={hidePeek}
      {...useTaskbarTransition()}
      {...useTitlebarContextMenu(id)}
    >
      <AnimatePresence initial={false} presenceAffectsLayout={false}>
        {isPeekVisible && <PeekWindow id={id} />}
      </AnimatePresence>
      <Button
        ref={linkTaskbarEntry}
        onClick={onClick}
        {...focusable}
        {...label(title)}
      >
        <figure>
          <Icon alt={title} imgSize={16} src={icon} />
          <figcaption>{title}</figcaption>
        </figure>
      </Button>
    </StyledTaskbarEntry>
  );
};

export default memo(TaskbarEntry);
