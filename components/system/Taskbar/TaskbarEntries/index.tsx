import StyledTaskbarEntries from 'components/system/Taskbar/TaskbarEntries/StyledTaskbarEntries';
import TaskbarEntry from 'components/system/Taskbar/TaskbarEntry';
import { ProcessConsumer } from 'contexts/process';

const TaskbarEntries = (): JSX.Element => (
  <StyledTaskbarEntries>
    <ProcessConsumer>
      {({ mapProcesses }) =>
        mapProcesses(([id, { icon, title }]) => (
          <TaskbarEntry key={id} icon={icon} id={id} title={title} />
        ))
      }
    </ProcessConsumer>
  </StyledTaskbarEntries>
);

export default TaskbarEntries;
