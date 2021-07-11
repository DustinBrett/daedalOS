import StyledTaskbarEntries from "components/system/Taskbar/TaskbarEntries/StyledTaskbarEntries";
import TaskbarEntry from "components/system/Taskbar/TaskbarEntry";
import { ProcessConsumer } from "contexts/process";
import { AnimatePresence } from "framer-motion";

const TaskbarEntries = (): JSX.Element => (
  <StyledTaskbarEntries>
    <ProcessConsumer>
      {({ processes = {} }) => (
        <AnimatePresence>
          {Object.entries(processes)
            .filter(([, { closing }]) => !closing)
            .map(([id, { icon, title }]) => (
              <TaskbarEntry key={id} icon={icon} id={id} title={title} />
            ))}
        </AnimatePresence>
      )}
    </ProcessConsumer>
  </StyledTaskbarEntries>
);

export default TaskbarEntries;
