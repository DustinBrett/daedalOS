import styles from '@/styles/System/Taskbar/TaskbarEntry.module.scss';

import type { FC } from 'react';

type TaskbarEntryType = {
  foreground: boolean;
  icon: string;
  name: string;
  onClick: () => void;
};

export const TaskbarEntry: FC<TaskbarEntryType> = ({
  foreground,
  icon,
  name,
  onClick
}) => (
  <div
    className={`${styles.taskbarEntry} ${foreground && styles.foreground}`}
    onClick={onClick}
    tabIndex={0}
  >
    <figure>
      <img alt={name} src={icon} draggable={false} />
      <figcaption>{name}</figcaption>
    </figure>
  </div>
);

export default TaskbarEntry;
