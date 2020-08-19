import type { FC } from 'react';
import type { AppType } from '../contexts/Apps';
import styles from '../styles/TaskbarEntry.module.scss';

export const TaskbarEntry: FC<AppType> = ({ icon, name }) => (
  <li className={styles.taskbarEntry}>
    {icon}
    {name}
  </li>
);
