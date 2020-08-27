import styles from '@/styles/TaskbarEntry.module.scss';

import type { FC } from 'react';

type TaskbarEntry = {
  foreground: boolean;
  icon: JSX.Element;
  name: string;
  onClick: () => void;
  tabIndex: number;
};

export const TaskbarEntry: FC<TaskbarEntry> = ({
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
      {icon}
      <figcaption>{name}</figcaption>
    </figure>
  </li>
);
