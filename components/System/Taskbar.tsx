import styles from '@/styles/System/Taskbar.module.scss';

import type { FC } from 'react';

import { useContext } from 'react';
import { AppsContext } from '@/contexts/Apps';
import { Clock } from '@/components/System/Clock';
import { TaskbarEntry } from '@/components/System/TaskbarEntry';
import { appToFocus } from 'utils/utils';

export const Taskbar: FC = () => {
  const { apps, updateApps } = useContext(AppsContext),
    runningApps = apps
      .filter(({ running }) => running)
      .sort((a, b) => a.lastRunning.getTime() - b.lastRunning.getTime());

  return (
    <nav className={styles.taskbar}>
      <ol>
        {runningApps.map(({ id, icon, minimized, name, foreground }, index) => (
          <TaskbarEntry
            key={id}
            foreground={foreground}
            icon={icon}
            name={name}
            onClick={() => {
              if (minimized) {
                updateApps({ update: { minimized: false }, id });
              } else {
                appToFocus(apps, updateApps, id);
              }
            }}
            tabIndex={apps.length + index}
          />
        ))}
      </ol>
      <Clock />
    </nav>
  );
};
