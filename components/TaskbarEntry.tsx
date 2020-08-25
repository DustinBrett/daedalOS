import type { FC } from 'react';
import styles from '../styles/TaskbarEntry.module.scss';

type TaskbarEntry = {
  icon: JSX.Element;
  name: string;
  onClick: () => void;
  tabIndex: number;
};

export const TaskbarEntry: FC<TaskbarEntry> = ({
  icon,
  name,
  onClick,
  tabIndex
}) => (
  <li className={styles.taskbarEntry} onClick={onClick} tabIndex={tabIndex}>
    <figure>
      {icon}
      <figcaption>{name}</figcaption>
    </figure>
  </li>
);
