import styles from '@/styles/System/Taskbar/Taskbar.module.scss';

import Clock from '@/components/System/Taskbar/Clock';
import StartMenu from '@/components/System/Taskbar/StartMenu';
import TaskbarEntries from '@/components/System/Taskbar/TaskbarEntries';
import { useRef } from 'react';

const Taskbar: React.FC = () => {
  const footerRef = useRef<HTMLElement>(null);

  return (
    <footer className={styles.footer} ref={footerRef}>
      <StartMenu footerRef={footerRef} />
      <div className={styles.taskbar}>
        <TaskbarEntries />
        <Clock />
      </div>
    </footer>
  );
};

export default Taskbar;
