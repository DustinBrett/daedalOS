import styles from '@/styles/System/Taskbar/TaskbarEntry.module.scss';

import type { TaskbarEntryProps } from '@/types/components/System/Taskbar/TaskbarEntry';

import Icon from '@/components/System/Icon';
import { motion } from 'framer-motion';
import { ProcessContext } from '@/contexts/ProcessManager';
import { SessionContext } from '@/contexts/SessionManager';
import { taskbarEntriesMotionSettings } from '@/utils/motions';
import { useCallback, useContext } from 'react';

const TaskbarEntry: React.FC<TaskbarEntryProps> = ({
  icon,
  id,
  name,
  onBlur,
  onClick
}) => {
  const {
    session: { foregroundId }
  } = useContext(SessionContext);
  const { taskbarElement } = useContext(ProcessContext);
  const refCallback = useCallback((element) => taskbarElement(id, element), [
    id
  ]);

  return (
    <motion.li {...taskbarEntriesMotionSettings}>
      <div
        className={`${styles.taskbarEntry} ${
          foregroundId === id && styles.foreground
        }`}
        ref={refCallback}
        role="button"
        onBlur={onBlur}
        onClick={onClick}
        tabIndex={0}
      >
        <figure>
          <Icon src={icon} />
          <figcaption>{name}</figcaption>
        </figure>
      </div>
    </motion.li>
  );
};

export default TaskbarEntry;
