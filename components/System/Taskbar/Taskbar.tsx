import styles from '@/styles/System/Taskbar.module.scss';

import type { FC } from 'react';

import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { useContext } from 'react';
import { AppsContext } from '@/contexts/Apps';
import { sortByLastRunning } from '@/utils/utils';
import Clock from '@/components/System/Taskbar/Clock';

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

export const Taskbar: FC = () => {
  const { apps, focus, minimize } = useContext(AppsContext);

  return (
    <nav className={styles.taskbar}>
      <ol>
        <AnimatePresence>
          {apps
            ?.sort(sortByLastRunning)
            .map(({ id, icon, minimized, name, foreground, stackOrder }) => (
              <motion.li key={id} {...taskbarEntriesMotionSettings}>
                <TaskbarEntry
                  foreground={foreground}
                  icon={icon}
                  name={name}
                  onClick={() => {
                    if (minimized) {
                      minimize?.(id, false);
                    } else {
                      const [foregroundApp] = stackOrder; // TODO: Top of stack order doesnt mean its foreground

                      foregroundApp === id ? minimize?.(id) : focus?.(id);
                    }
                  }}
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
