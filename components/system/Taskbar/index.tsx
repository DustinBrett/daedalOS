import Clock from 'components/system/Taskbar/Clock';
import StartButton from 'components/system/Taskbar/StartButton';
import TaskbarEntries from 'components/system/Taskbar/TaskbarEntries';
import StyledTaskbar from 'styles/components/system/Taskbar/StyledTaskbar';

const Taskbar: React.FC = () => (
  <StyledTaskbar>
    <StartButton />
    <TaskbarEntries />
    <Clock />
  </StyledTaskbar>
);

export default Taskbar;
