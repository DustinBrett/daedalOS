import styles from '@/styles/System/TaskbarEntry.module.scss';

import type { FC } from 'react';

type TaskbarEntryType = {
  foreground: boolean;
  icon: string;
  name: string;
  onClick: () => void;
  tabIndex: number;
};

export const TaskbarEntry: FC<TaskbarEntryType> = ({
  foreground,
  icon,
  name,
  onClick,
  tabIndex
}) => (
  <li
    className={`${styles.taskbarEntry} ${foreground && styles.foreground}`}
    onClick={onClick}
    tabIndex={tabIndex}
  >
    <figure>
      <img alt={name} src={icon} draggable={false} />
      <figcaption>{name}</figcaption>
    </figure>
  </li>
);

export default TaskbarEntry;
