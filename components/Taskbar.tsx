import type { FC } from 'react';
import styles from '../styles/Taskbar.module.scss';
import { AppsContext } from '../contexts/Apps';
import { useContext } from 'react';
import { Clock } from './Clock';
import { TaskbarEntry } from './TaskbarEntry';

export const Taskbar: FC = () => {
  const { apps, updateApps } = useContext(AppsContext);

  return (
    <nav className={styles.taskbar}>
      <ol className={styles.taskbarEntries}>
        {apps
          .filter((app) => app.running)
          .map((app) => (
            <TaskbarEntry
              key={app.id}
              icon={app.icon}
              name={app.name}
              onClick={() => {
                app?.setMinimized?.(!app?.minimized);
                updateApps(apps); // TODO: State should have reducer that takes actions instead of these funcs, then I can deconstruct this `app.`
              }}
            />
          ))}
      </ol>
      <Clock />
    </nav>
  );
};
