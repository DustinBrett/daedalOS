import styles from '@/styles/System/Taskbar/Taskbar.module.scss';

import Clock from '@/components/System/Taskbar/Clock';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import { cycleWindowState } from '@/utils/taskbar';
import { ProcessContext } from '@/contexts/ProcessManager';
import { SessionContext } from '@/contexts/SessionManager';
import { useContext } from 'react';

const TaskbarEntry = dynamic(
  import('@/components/System/Taskbar/TaskbarEntry')
);

const Taskbar: React.FC = () => {
  const { processes, minimize, restore } = useContext(ProcessContext);
  const { session, foreground } = useContext(SessionContext);

  return (
    <nav className={styles.taskbar}>
      <ol className={styles.entries}>
        <AnimatePresence>
          {processes.map(({ id, icon, minimized, name }) => (
            <TaskbarEntry
              key={id}
              icon={icon}
              id={id}
              name={name}
              onBlur={() => foreground('')}
              onClick={() =>
                cycleWindowState({
                  id,
                  session,
                  minimized,
                  foreground,
                  minimize,
                  restore
                })
              }
            />
          ))}
        </AnimatePresence>
      </ol>
      <Clock />
    </nav>
  );
};

export default Taskbar;
