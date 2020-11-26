import styles from '@/styles/System/Taskbar/Taskbar.module.scss';

import Clock from '@/components/System/Taskbar/Clock';
import StartMenu from '@/components/System/Taskbar/StartMenu';
import TaskbarEntries from '@/components/System/Taskbar/TaskbarEntries';
import { useRef } from 'react';

const Taskbar: React.FC = () => {
  const taskbarRef = useRef<HTMLElement>(null);

  return (
    <footer className={styles.footer}>
      <StartMenu taskbarRef={taskbarRef} />
      <nav className={styles.taskbar} ref={taskbarRef} tabIndex={-1}>
        <TaskbarEntries />
        <Clock />
      </nav>
    </footer>
  );
};

export default Taskbar;
