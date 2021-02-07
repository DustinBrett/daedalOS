import Clock from 'components/system/Clock';
import StartButton from 'components/system/StartButton';
import TaskbarEntries from 'components/system/TaskbarEntries';
import StyledTaskbar from 'styles/components/system/StyledTaskbar';

const Taskbar: React.FC = () => (
  <StyledTaskbar>
    <StartButton />
    <TaskbarEntries />
    <Clock />
  </StyledTaskbar>
);

export default Taskbar;
