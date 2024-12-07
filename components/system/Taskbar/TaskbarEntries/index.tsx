import { AnimatePresence } from "motion/react";
import dynamic from "next/dynamic";
import { memo } from "react";
import StyledTaskbarEntries from "components/system/Taskbar/TaskbarEntries/StyledTaskbarEntries";
import { useProcesses } from "contexts/process";

const TaskbarEntry = dynamic(
  () => import("components/system/Taskbar/TaskbarEntry")
);

type TaskbarEntriesProps = {
  clockWidth: number;
  hasAI: boolean;
};

const TaskbarEntries: FC<TaskbarEntriesProps> = ({ clockWidth, hasAI }) => {
  const { processes = {} } = useProcesses();

  return (
    <StyledTaskbarEntries $clockWidth={clockWidth} $hasAI={hasAI}>
      <AnimatePresence initial={false} presenceAffectsLayout={false}>
        {Object.entries(processes)
          .filter(
            ([, { closing, hideTaskbarEntry }]) => !closing && !hideTaskbarEntry
          )
          .map(([id, { icon, title }]) => (
            <TaskbarEntry key={id} icon={icon} id={id} title={title} />
          ))}
      </AnimatePresence>
    </StyledTaskbarEntries>
  );
};

export default memo(TaskbarEntries);
