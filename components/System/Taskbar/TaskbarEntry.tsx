import styles from '@/styles/System/Taskbar/TaskbarEntry.module.scss';

import type { TaskbarEntryProps } from '@/types/components/System/Taskbar/TaskbarEntry';

import Icon from '@/components/System/Icon';
import { cycleWindowState } from '@/utils/taskbar';
import { motion } from 'framer-motion';
import { ProcessContext } from '@/contexts/ProcessManager';
import { SessionContext } from '@/contexts/SessionManager';
import { taskbarEntriesMotionSettings } from '@/utils/motions';
import { useCallback, useContext } from 'react';

const TaskbarEntry: React.FC<TaskbarEntryProps> = ({
  icon,
  id,
  minimized,
  name
}) => {
  const {
    foreground,
    session: { foregroundId }
  } = useContext(SessionContext);
  const { minimize, restore, taskbarElement } = useContext(ProcessContext);
  const refCallback = useCallback((element) => taskbarElement(id, element), [
    id
  ]);
  const onBlur = () => foreground('');
  const onClick = useCallback(
    () =>
      cycleWindowState({
        foregroundId,
        id,
        minimized,
        foreground,
        minimize,
        restore
      }),
    [foregroundId, id, minimized]
  );

  return (
    <motion.li {...taskbarEntriesMotionSettings}>
      <button
        className={`${styles.taskbarEntry} ${
          foregroundId === id && styles.foreground
        }`}
        type="button"
        ref={refCallback}
        onBlur={onBlur}
        onClick={onClick}
        tabIndex={-1}
      >
        <figure>
          <Icon src={icon} height={16} width={16} />
          <figcaption>{name}</figcaption>
        </figure>
      </button>
    </motion.li>
  );
};

export default TaskbarEntry;
