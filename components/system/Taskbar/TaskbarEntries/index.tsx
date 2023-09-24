import StyledTaskbarEntries from "components/system/Taskbar/TaskbarEntries/StyledTaskbarEntries";
import { useProcesses } from "contexts/process";
import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { memo } from "react";

const TaskbarEntry = dynamic(
  () => import("components/system/Taskbar/TaskbarEntry")
);

type TaskbarEntriesProps = {
  clockWidth: number;
};

const TaskbarEntries: FC<TaskbarEntriesProps> = ({ clockWidth }) => {
  const { processes = {} } = useProcesses();

  return (
    <StyledTaskbarEntries $clockWidth={clockWidth}>
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
