import StyledTaskbarEntries from "components/system/Taskbar/TaskbarEntries/StyledTaskbarEntries";
import { useProcesses } from "contexts/process";
import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const TaskbarEntry = dynamic(
  () => import("components/system/Taskbar/TaskbarEntry")
);

const TaskbarEntries: FC = () => {
  const { processes = {} } = useProcesses();

  return (
    <StyledTaskbarEntries>
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

export default TaskbarEntries;
