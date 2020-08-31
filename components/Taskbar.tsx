import styles from '@/styles/Taskbar.module.scss';

import type { FC } from 'react';
import { useContext } from 'react';
import { AppsContext } from '@/contexts/Apps';
import { Clock } from '@/components/Clock';
import { TaskbarEntry } from '@/components/TaskbarEntry';

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
                apps.forEach(({ id: appId }) => {
                  updateApps({
                    update: { foreground: id === appId },
                    id: appId
                  });
                });
                apps.forEach(({ id: appId, stackOrder }) => {
                  updateApps({
                    update: {
                      stackOrder: [
                        id,
                        ...stackOrder.filter(
                          (windowId: string) => windowId !== id
                        )
                      ]
                    },
                    id: appId
                  });
                });
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
