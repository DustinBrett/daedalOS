import { AnimatePresence, useIsPresent } from "motion/react";
import dynamic from "next/dynamic";
// eslint-disable-next-line no-restricted-imports -- TaskbarEntries re-maps every entry on any process change
import { memo, useEffect, useRef, useState } from "react";
import StyledTaskbarEntry from "components/system/Taskbar/TaskbarEntry/StyledTaskbarEntry";
import useTaskbarTransition from "components/system/Taskbar/TaskbarEntry/useTaskbarTransition";
import useTitlebarContextMenu from "components/system/Window/Titlebar/useTitlebarContextMenu";
import useNextFocusable from "components/system/Window/useNextFocusable";
import { useProcess, useProcessesActions } from "contexts/process";
import { useForegroundId, useSessionActions } from "contexts/session";
import Button from "styles/common/Button";
import Icon from "styles/common/Icon";
import {
  CLICK_FOCUSABLE_ELEMENT,
  PEEK_DELAY_MS,
  PROCESS_DELIMITER,
} from "utils/constants";
import { label } from "utils/functions";
import { focusWithin, isKeyboardNavigating } from "utils/keyboard";

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
  const { setForegroundId } = useSessionActions();
  const foregroundId = useForegroundId();
  const isForeground = id === foregroundId;
  const { linkElement, minimize, open } = useProcessesActions();
  const { componentWindow, minimized, progress, singleton } = useProcess(id);
  const isPresent = useIsPresent();
  const linkTaskbarEntry = (taskbarEntry: HTMLButtonElement | null): void => {
    if (taskbarEntry) linkElement(id, "taskbarEntry", taskbarEntry);
  };
  const [isPeekVisible, setIsPeekVisible] = useState(false);
  const hidePeekTimerRef = useRef(0);
  const focusPeekTimerRef = useRef(0);
  const hidePeek = ({ currentTarget }: React.MouseEvent<HTMLElement>): void => {
    hidePeekTimerRef.current = window.setTimeout(
      () => setIsPeekVisible(false),
      currentTarget.querySelector(".peekWindow:not([inert])") ? 200 : 0
    );
  };
  const resetPeekTimer = (): void => {
    if (hidePeekTimerRef.current) {
      window.clearTimeout(hidePeekTimerRef.current);
      hidePeekTimerRef.current = 0;
    }
  };
  const showPeek = (): void => {
    resetPeekTimer();
    setIsPeekVisible(true);
  };
  const closePeek = (): void => {
    resetPeekTimer();
    setIsPeekVisible(false);
  };
  const onClick: React.MouseEventHandler<HTMLButtonElement> = (event): void => {
    if (event.shiftKey && !singleton) {
      const [pid] = id.split(PROCESS_DELIMITER);

      open(pid);
    } else {
      if (minimized || isForeground) minimize(id);

      // Still in front after Ctrl+Shift+Down, so only its focus comes back
      if (minimized && isForeground) {
        requestAnimationFrame(() => focusWithin(componentWindow));
      } else setForegroundId(isForeground ? nextFocusableId : id);
    }
  };
  useEffect(() => {
    const onKeyDown = ({ key }: KeyboardEvent): void => {
      if (key === "Escape") closePeek();
    };

    if (isPeekVisible) {
      window.addEventListener("keydown", onKeyDown, { passive: true });
    }

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closePeek, isPeekVisible]);
  const titlebarContextMenu = useTitlebarContextMenu(id);
  const onContextMenuCapture: React.MouseEventHandler<HTMLElement> = (
    event
  ) => {
    closePeek();
    titlebarContextMenu.onContextMenuCapture?.(event);
  };

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
      {isPresent && (
        <AnimatePresence initial={false} presenceAffectsLayout={false}>
          {isPeekVisible && <PeekWindow id={id} onHide={closePeek} />}
        </AnimatePresence>
      )}
      <Button
        ref={linkTaskbarEntry}
        aria-pressed={isForeground}
        onBlur={({ currentTarget, relatedTarget }) => {
          const entry = currentTarget.parentElement;

          window.clearTimeout(focusPeekTimerRef.current);

          if (!entry?.contains(relatedTarget) && !entry?.matches(":hover")) {
            closePeek();
          }
        }}
        onClick={onClick}
        // Like Win+T, keyboard focus resting on an entry previews its window,
        // but not when it's from minimizing that window
        onFocus={({ relatedTarget }) => {
          if (
            isKeyboardNavigating() &&
            !componentWindow?.contains(relatedTarget)
          ) {
            focusPeekTimerRef.current = window.setTimeout(
              showPeek,
              PEEK_DELAY_MS
            );
          }
        }}
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
