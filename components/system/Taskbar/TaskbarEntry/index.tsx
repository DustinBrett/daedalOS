import PeekWindow from "components/system/Taskbar/TaskbarEntry/Peek/PeekWindow";
import StyledTaskbarEntry from "components/system/Taskbar/TaskbarEntry/StyledTaskbarEntry";
import useTaskbarTransition from "components/system/Taskbar/TaskbarEntry/useTaskbarTransition";
import useTitlebarContextMenu from "components/system/Window/Titlebar/useTitlebarContextMenu";
import useNextFocusable from "components/system/Window/useNextFocusable";
import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import { useSession } from "contexts/session";
import { AnimatePresence } from "framer-motion";
import { useCallback, useState } from "react";
import Button from "styles/common/Button";
import Icon from "styles/common/Icon";
import { PROCESS_DELIMITER } from "utils/constants";

type TaskbarEntryProps = {
  icon: string;
  id: string;
  title: string;
};

const TaskbarEntry = ({ icon, id, title }: TaskbarEntryProps): JSX.Element => {
  const nextFocusableId = useNextFocusable(id);
  const { foregroundId, setForegroundId } = useSession();
  const isForeground = id === foregroundId;
  const {
    linkElement,
    minimize,
    processes: { [id]: process },
  } = useProcesses();
  const { minimized, prependTaskbarTitle } = process || {};
  const [pid] = id.split(PROCESS_DELIMITER);
  const { title: defaultTitle } = processDirectory[pid];
  const linkTaskbarEntry = useCallback(
    (taskbarEntry: HTMLButtonElement) =>
      taskbarEntry && linkElement(id, "taskbarEntry", taskbarEntry),
    [id, linkElement]
  );
  const [isPeekVisible, setPeekVisible] = useState(false);
  const hidePeek = (): void => setPeekVisible(false);
  const showPeek = (): void => setPeekVisible(true);
  const onClick = (): void => {
    if (minimized || isForeground) minimize(id);

    setForegroundId(isForeground ? nextFocusableId : id);
  };
  const taskbarTitle = prependTaskbarTitle
    ? `${title.replace(`${defaultTitle} - `, "")} - ${defaultTitle}`
    : title;

  return (
    <StyledTaskbarEntry
      $foreground={isForeground}
      onClick={hidePeek}
      onMouseEnter={showPeek}
      onMouseLeave={hidePeek}
      title={taskbarTitle}
      {...useTaskbarTransition()}
      {...useTitlebarContextMenu(id)}
    >
      <AnimatePresence>
        {isPeekVisible && <PeekWindow id={id} />}
      </AnimatePresence>
      <Button ref={linkTaskbarEntry} onClick={onClick}>
        <figure>
          <Icon alt={taskbarTitle} imgSize={16} src={icon} />
          <figcaption>{taskbarTitle}</figcaption>
        </figure>
      </Button>
    </StyledTaskbarEntry>
  );
};

export default TaskbarEntry;
