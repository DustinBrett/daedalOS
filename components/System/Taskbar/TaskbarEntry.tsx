import styles from '@/styles/System/Taskbar/TaskbarEntry.module.scss';

import type { FC } from 'react';

import { SessionContext } from '@/contexts/SessionManager';
import { TaskbarEntryType } from '@/types/components/System/Taskbar/TaskbarEntry';

export const TaskbarEntry: FC<TaskbarEntryType> = ({
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
          <img alt={name} draggable={false} src={icon} />
          <figcaption>{name}</figcaption>
        </figure>
      </div>
    )}
  </SessionContext.Consumer>
);

export default TaskbarEntry;
