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
      <ol>
        {apps
          .filter((app) => app.running)
          .map(({ id, icon, minimized, name, foreground }, index) => (
            <TaskbarEntry
              key={id}
              foreground={foreground} // TODO: Set based on which Window is in focus
              icon={icon}
              name={name}
              onClick={() =>
                updateApps({ update: { minimized: !minimized }, id })
              }
              tabIndex={apps.length + index}
            />
          ))}
      </ol>
      <Clock />
    </nav>
  );
};
