import type { FC } from 'react';
import type { App } from '../contexts/Apps';
import styles from '../styles/TaskbarEntry.module.scss';

export const TaskbarEntry: FC<App> = ({ icon, name }) => (
  <li className={styles.taskbarEntry}>
    {icon}
    {name}
  </li>
);
