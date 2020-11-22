import styles from '@/styles/System/Taskbar/Taskbar.module.scss';

import Clock from '@/components/System/Taskbar/Clock';
import StartMenu from '@/components/System/Taskbar/StartMenu';
import TaskbarEntries from '@/components/System/Taskbar/TaskbarEntries';

const Taskbar: React.FC = () => (
  <footer className={styles.footer}>
    <StartMenu />
    <nav className={styles.taskbar}>
      <TaskbarEntries />
      <Clock />
    </nav>
  </footer>
);

export default Taskbar;
