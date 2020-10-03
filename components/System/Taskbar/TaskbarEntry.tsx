import styles from '@/styles/System/Taskbar/TaskbarEntry.module.scss';

import type { TaskbarEntryProps } from '@/types/components/System/Taskbar/TaskbarEntry';

import { SessionContext } from '@/contexts/SessionManager';
import Icon from '@/components/System/Icon';

const TaskbarEntry: React.FC<TaskbarEntryProps> = ({
  icon,
  id,
  name,
  onBlur,
  onClick
}) => (
  <SessionContext.Consumer>
    {({ session: { foregroundId } }) => (
      <div
        className={`${styles.taskbarEntry} ${
          foregroundId === id && styles.foreground
        }`}
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
    )}
  </SessionContext.Consumer>
);

export default TaskbarEntry;
