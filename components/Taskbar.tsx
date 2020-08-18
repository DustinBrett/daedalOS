// import { useContext } from 'react';
// import { AnimatePresence, motion } from 'framer-motion';
// import { AppsContext } from '../resources/AppsProvider';

// const motionSettings = {
//   initial: { opacity: 0, x: -100 },
//   animate: { opacity: 1, x: 0 },
//   transition: {
//     x: {
//       type: 'spring'
//     }
//   },
//   exit: { opacity: 0, transition: { duration: 0.3 }, x: -100 }
// };

// const { apps = {} } = useContext(AppsContext);

//   <AnimatePresence>
//         <motion.div
//           {...motionSettings}
//         >
//         </motion.div>
//   </AnimatePresence>

import type { FC } from 'react';
import { Clock } from './Clock';
import { TaskbarEntry } from './TaskbarEntry';
import styles from '../styles/Taskbar.module.scss';

const apps = [{
  name: 'Blog',
  // icon: <BlogIcon />,
  // component: <Blog />,
  running: true
}];

export const Taskbar: FC = () => {
  return (
    <nav className={ styles.taskbar }>
      <ol className={ styles.taskbarEntries }>
        { apps
          .filter(app => app.running)
          .map(app => <TaskbarEntry key={ app.name } {...app} />)
        }
      </ol>
      <Clock />
    </nav>
  );
};
