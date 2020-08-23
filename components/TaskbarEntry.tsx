import type { FC } from 'react';
import styles from '../styles/TaskbarEntry.module.scss';

type TaskbarEntry = {
  icon: JSX.Element;
  name: string;
  onClick: () => void;
};

export const TaskbarEntry: FC<TaskbarEntry> = ({ icon, name, onClick }) => (
  <li className={styles.taskbarEntry} onClick={onClick}>
    <figure>
      {icon}
      <figcaption>{name}</figcaption>
    </figure>
  </li>
);
