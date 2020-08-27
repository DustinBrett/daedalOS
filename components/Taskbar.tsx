import styles from '@/styles/Taskbar.module.scss';

import type { FC } from 'react';
import { useContext } from 'react';
import { AppsContext } from '@/contexts/Apps';
import { Clock } from '@/components/Clock';
import { TaskbarEntry } from '@/components/TaskbarEntry';

// TODO: Clicking taskbar entry should also count as window is in focus
// TODO: If in focus and taskbar clicked, it should min/max, otherwise just focus

export const Taskbar: FC = () => {
  const { apps, updateApps } = useContext(AppsContext),
    runningApps = apps.filter(({ running }) => running);

  return (
    <nav className={styles.taskbar}>
      <ol>
        {runningApps.map(({ id, icon, minimized, name, foreground }, index) => (
          <TaskbarEntry
            key={id}
            foreground={foreground}
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
