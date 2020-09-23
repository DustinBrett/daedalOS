import styles from '@/styles/System/Taskbar/Taskbar.module.scss';

import type { FC } from 'react';

import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { useContext } from 'react';
import { ProcessContext } from '@/contexts/ProcessManager';
import { SessionContext } from '@/contexts/SessionManager';
import { cycleWindowState } from '@/utils/taskbar';
import { taskbarEntriesMotionSettings } from '@/utils/motions';
import Clock from '@/components/System/Taskbar/Clock';

const TaskbarEntry = dynamic(
  import('@/components/System/Taskbar/TaskbarEntry')
);

export const Taskbar: FC = () => {
  const { processes, minimize, restore } = useContext(ProcessContext),
    { session, background, foreground } = useContext(SessionContext);

  return (
    <nav className={styles.taskbar}>
      <ol className={styles.entries}>
        <AnimatePresence>
          {processes.map(({ id, icon, minimized, name }) => (
            <motion.li key={id} {...taskbarEntriesMotionSettings}>
              <TaskbarEntry
                icon={icon}
                id={id}
                name={name}
                onBlur={() => background(id)}
                onClick={() =>
                  cycleWindowState({
                    id,
                    session,
                    minimized,
                    background,
                    foreground,
                    minimize,
                    restore
                  })
                }
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
      <Clock />
    </nav>
  );
};

export default Taskbar;
