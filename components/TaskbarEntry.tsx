import type { FC } from 'react';
import styles from '../styles/TaskbarEntry.module.scss';

type TaskbarEntry = {
  icon: JSX.Element,
  name: String
};

export const TaskbarEntry: FC<TaskbarEntry> = ({ icon, name }) => {
  return (
    <li className={ styles.taskbarEntry }>
      { icon }
      { name }
    </li>
  );
};
