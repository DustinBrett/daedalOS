import styles from '@/styles/System/Taskbar/TaskbarEntry.module.scss';

import type { FC } from 'react';

import { SessionContext } from '@/contexts/SessionManager';
import { TaskbarEntryType } from '@/components/System/Taskbar/TaskbarEntry.d';

export const TaskbarEntry: FC<TaskbarEntryType> = ({
  icon,
  id,
  name,
  onBlur,
  onClick
}) => (
  <SessionContext.Consumer>
    {({ session }) => (
      <div
        className={`${styles.taskbarEntry} ${
          session.foreground === id && styles.foreground
        }`}
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
