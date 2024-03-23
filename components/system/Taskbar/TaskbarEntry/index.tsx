import { memo, useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import StyledTaskbarEntry from "components/system/Taskbar/TaskbarEntry/StyledTaskbarEntry";
import useTaskbarTransition from "components/system/Taskbar/TaskbarEntry/useTaskbarTransition";
import useTitlebarContextMenu from "components/system/Window/Titlebar/useTitlebarContextMenu";
import useNextFocusable from "components/system/Window/useNextFocusable";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import Button from "styles/common/Button";
import Icon from "styles/common/Icon";
import { DIV_BUTTON_PROPS } from "utils/constants";
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
    processes: { [id]: process },
  } = useProcesses();
  const { minimized, progress } = process || {};
  const linkTaskbarEntry = useCallback(
    (taskbarEntry: HTMLButtonElement | HTMLDivElement | null) => {
      if (taskbarEntry) linkElement(id, "taskbarEntry", taskbarEntry);
    },
    [id, linkElement]
  );
  const [isPeekVisible, setIsPeekVisible] = useState(false);
  const hidePeek = (): void => setIsPeekVisible(false);
  const showPeek = (): void => setIsPeekVisible(true);
  const onClick = (): void => {
    if (minimized || isForeground) minimize(id);

    setForegroundId(isForeground ? nextFocusableId : id);
  };
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
