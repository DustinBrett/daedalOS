import styles from '@/styles/System/Taskbar/Taskbar.module.scss';

import type { FC } from 'react';

import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { useContext, useEffect, useRef, useState } from 'react';
import { ProcessContext } from '@/contexts/ProcessManager';
import { SessionContext } from '@/contexts/SessionManager';
import Clock from '@/components/System/Taskbar/Clock';
import SystemTray from '@/components/System/Taskbar/SystemTray';

const TaskbarEntry = dynamic(
  import('@/components/System/Taskbar/TaskbarEntry')
);

const taskbarEntriesMotionSettings = {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 },
  transition: {
    x: {
      type: 'spring'
    }
  },
  exit: { opacity: 0, width: 0, transition: { duration: 0.3 }, x: -100 }
};

const maxWidth = 159;

export const Taskbar: FC = () => {
  const { processes, focus, minimize } = useContext(ProcessContext),
    { session, foreground } = useContext(SessionContext),
    olRef = useRef<HTMLOListElement>(null),
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
                onClick={() => {
                  if (minimized) {
                    minimize?.(id, false);
                  } else {
                    if (session.foreground === id) {
                      minimize?.(id);
                    } else {
                      focus?.(id); // TODO: Get rid of need for this
                      foreground?.(id);
                    }
                  }
                  // TODO: Call background if minimize is run?
                }}
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
      <SystemTray />
      <Clock />
    </nav>
  );
};

export default Taskbar;
