import styles from '@/styles/System/Taskbar/Taskbar.module.scss';

import type { FC } from 'react';

import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { useContext, useEffect, useRef, useState } from 'react';
import { ProcessContext } from '@/contexts/ProcessManager';
import { SessionContext } from '@/contexts/SessionManager';
import { cycleWindowState } from '@/utils/taskbar';
import { taskbarEntriesMotionSettings } from '@/utils/motions';
import Clock from '@/components/System/Taskbar/Clock';

const TaskbarEntry = dynamic(
  import('@/components/System/Taskbar/TaskbarEntry')
);

// TODO: Remove the need for setting entry widths

export const Taskbar: FC = () => {
  const { processes, minimize, restore } = useContext(ProcessContext),
    { session, background, foreground } = useContext(SessionContext),
    olRef = useRef<HTMLOListElement>(null),
    maxWidth = 159,
    [entryWidth, setEntryWidth] = useState(maxWidth);

  useEffect(() => {
    setEntryWidth(
      Math.min(
        maxWidth,
        olRef.current?.offsetWidth
          ? olRef.current?.offsetWidth / processes.length
          : maxWidth
      )
    );
  }, [processes]);

  return (
    <nav className={styles.taskbar}>
      <ol className={styles.entries} ref={olRef}>
        <AnimatePresence>
          {processes.map(({ id, icon, minimized, name }) => (
            <motion.li
              key={id}
              {...taskbarEntriesMotionSettings}
              style={{ width: entryWidth }}
            >
              <TaskbarEntry
                icon={icon}
                id={id}
                name={name}
                onBlur={() => background?.(id)}
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
