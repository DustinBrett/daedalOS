import type { FC } from 'react';
import { useContext } from 'react';
import { Clock } from './Clock';
import { TaskbarEntry } from './TaskbarEntry';
import { AppsContext } from '../contexts/Apps';
import styles from '../styles/Taskbar.module.scss';

export const Taskbar: FC = () => (
  <nav className={ styles.taskbar }>
    <ol className={ styles.taskbarEntries }>
      { useContext(AppsContext)
        .apps
        .filter(app => app.running)
        .map(app => <TaskbarEntry key={ app.id } { ...app } />)
      }
    </ol>
    <Clock />
  </nav>
);
