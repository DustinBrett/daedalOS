import type { FC } from 'react';
import type App from '../contexts/App';

import styles from '../styles/Taskbar.module.scss';

import { Clock } from './Clock';
import { TaskbarEntry } from './TaskbarEntry';

export const Taskbar: FC<{ apps: Array<App> }> = ({ apps }) => (
  <nav className={styles.taskbar}>
    <ol className={styles.taskbarEntries}>
      {apps
        .filter((app) => app.running)
        .map((app) => (
          <TaskbarEntry
            key={app.id}
            icon={app.icon}
            name={app.name}
            onClick={() => app?.setMinimized?.(!app?.minimized)}
          />
        ))}
    </ol>
    <Clock />
  </nav>
);
