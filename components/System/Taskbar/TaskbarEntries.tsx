import styles from '@/styles/System/Taskbar/TaskbarEntries.module.scss';

import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import { ProcessContext } from '@/contexts/ProcessManager';

const TaskbarEntry = dynamic(
  import('@/components/System/Taskbar/TaskbarEntry')
);

const TaskbarEntries: React.FC = () => (
  <nav>
    <ol className={styles.taskbarEntries}>
      <AnimatePresence>
        <ProcessContext.Consumer>
          {({ processes }) =>
            processes.map(({ icon, id, minimized, name }) => (
              <TaskbarEntry
                key={id}
                icon={icon}
                id={id}
                minimized={minimized}
                name={name}
              />
            ))
          }
        </ProcessContext.Consumer>
      </AnimatePresence>
    </ol>
  </nav>
);

export default TaskbarEntries;
