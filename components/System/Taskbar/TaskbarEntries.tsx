import styles from '@/styles/System/Taskbar/TaskbarEntries.module.scss';

import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import { ProcessContext } from '@/contexts/ProcessManager';
import { useContext } from 'react';

const TaskbarEntry = dynamic(
  import('@/components/System/Taskbar/TaskbarEntry')
);

const TaskbarEntries: React.FC = () => {
  const { processes } = useContext(ProcessContext);

  return (
    <nav>
      <ol className={styles.taskbarEntries}>
        <AnimatePresence>
          {processes.map(({ icon, id, minimized, name }) => (
            <TaskbarEntry
              key={id}
              icon={icon}
              id={id}
              minimized={minimized}
              name={name}
            />
          ))}
        </AnimatePresence>
      </ol>
    </nav>
  );
};

export default TaskbarEntries;
