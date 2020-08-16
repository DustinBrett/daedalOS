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
  exit: { opacity: 0, transition: { duration: 0.3 }, y: 100 }
}

export default function Windows() {
  const { apps = {} } = useContext(AppsContext);

  // Load windows delayed to show popup actions, 100 ms setTimeouts for each window entry, and pop in animations
    // And handle animating children and such with the lib
  return (
    <AnimatePresence>
      { Object.entries(apps as Apps)
          .filter(([_id, app]) => app.opened && !app.minimized)
          .map(([id, app]) => (
            <motion.div
              key={ id }
              style={{ position: 'absolute', zIndex: 1000 }}
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
