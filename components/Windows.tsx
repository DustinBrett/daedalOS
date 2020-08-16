import type { Apps } from '../resources/apps';

import { useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppsContext } from '../resources/AppsProvider';
import { Window } from './Window';

const motionSettings = {
  initial: { opacity: 0, y: 100 },
  animate: { opacity: 1, y: 0 },
  transition: {
    y: {
      damping: 15,
      stiffness: 800,
      type: 'spring'
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3
    },
    y: 100
  }
}

// Can't touch/drag buttons until animation is done
  // Does z-index fix this?
export default function Windows() {
  const { apps = {} } = useContext(AppsContext);

  return (
    <AnimatePresence>
      { Object.entries(apps as Apps)
          .filter(([_id, app]) => app.opened && !app.minimized)
          .map(([id, app]) => (
            <motion.div
              key={ id }
              {...motionSettings}
            >
              <Window id={ id } title={ app.name }>
                { app.component }
              </Window>
            </motion.div>
          )) }
    </AnimatePresence>
  );
};
