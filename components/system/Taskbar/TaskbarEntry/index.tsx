import { memo, useCallback, useEffect, useRef, useState } from "react";
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
import { CLICK_FOCUSABLE_ELEMENT, PROCESS_DELIMITER } from "utils/constants";
import { label } from "utils/functions";

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
    (taskbarEntry: HTMLButtonElement | null) => {
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
  const resetPeekTimer = useCallback(() => {
    if (hidePeekTimerRef.current) {
      window.clearTimeout(hidePeekTimerRef.current);
      hidePeekTimerRef.current = 0;
    }
  }, []);
  const showPeek = useCallback(() => {
    resetPeekTimer();
    setIsPeekVisible(true);
  }, [resetPeekTimer]);
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
  useEffect(() => {
    const onKeyDown = ({ key }: KeyboardEvent): void => {
      if (key === "Escape") {
        resetPeekTimer();
        setIsPeekVisible(false);
      }
    };

    if (isPeekVisible) {
      window.addEventListener("keydown", onKeyDown, { passive: true });
    }

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPeekVisible, resetPeekTimer]);
  const titlebarContextMenu = useTitlebarContextMenu(id);
  const onContextMenuCapture = useCallback<
    React.MouseEventHandler<HTMLElement>
  >(
    (event) => {
      resetPeekTimer();
      setIsPeekVisible(false);
      titlebarContextMenu.onContextMenuCapture?.(event);
    },
    [resetPeekTimer, titlebarContextMenu]
  );

  return (
    <StyledTaskbarEntry
      $foreground={isForeground}
      $progress={progress}
      onClick={hidePeek}
      onMouseEnter={showPeek}
      onMouseLeave={hidePeek}
      {...useTaskbarTransition()}
      {...titlebarContextMenu}
      onContextMenuCapture={onContextMenuCapture}
    >
      <AnimatePresence initial={false} presenceAffectsLayout={false}>
        {isPeekVisible && <PeekWindow id={id} />}
      </AnimatePresence>
      <Button
        ref={linkTaskbarEntry}
        aria-pressed={isForeground}
        onClick={onClick}
        {...CLICK_FOCUSABLE_ELEMENT}
        {...label(title, `${title} - 1 running window`)}
      >
        <figure>
          <Icon alt="" imgSize={16} src={icon} />
          <figcaption>{title}</figcaption>
        </figure>
      </Button>
    </StyledTaskbarEntry>
  );
};

export default memo(TaskbarEntry);
