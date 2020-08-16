import type { Apps } from '../resources/apps';

import styles from '../styles/Taskbar.module.scss';
import { useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppsContext } from '../resources/AppsProvider';
import Clock from './Clock';
import TaskbarEntry from './TaskbarEntry';

const motionSettings = {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 },
  transition: {
    x: {
      type: 'spring'
    }
  },
  exit: { opacity: 0, transition: { duration: 0.3 }, x: -100 }
}

export default function Taskbar() {
  const { apps = {} } = useContext(AppsContext);

  return (
    <div className={ styles.taskbar }>
      <div className={ styles.taskbar_entries }>
        <AnimatePresence>
          { Object.entries(apps as Apps)
            .filter(([_id, app]) => app.opened)
            .map(([id, app]) => (
              <motion.div
                key={ id }
                {...motionSettings}
              >
                <TaskbarEntry icon={ app.icon } id={ id } name={ app.name } />
              </motion.div>
          )) }
        </AnimatePresence>
      </div>
      <Clock hour12={ true } />
    </div>
  );
};
