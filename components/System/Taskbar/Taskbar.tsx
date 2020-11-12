import styles from '@/styles/System/Taskbar/Taskbar.module.scss';

import Clock from '@/components/System/Taskbar/Clock';
import StartMenu from '@/components/System/Taskbar/StartMenu';
import TaskbarEntries from '@/components/System/Taskbar/TaskbarEntries';

const Taskbar: React.FC = () => (
  <>
    <StartMenu />
    <footer className={styles.taskbar}>
      <TaskbarEntries />
      <Clock />
    </footer>
  </>
);

export default Taskbar;
