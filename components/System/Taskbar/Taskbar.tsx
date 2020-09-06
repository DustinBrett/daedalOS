import styles from '@/styles/System/Taskbar.module.scss';

import { FC, useContext } from 'react';

import { AppsContext } from '@/contexts/Apps';
import { Clock } from '@/components/System/Taskbar/Clock';
import { TaskbarEntry } from '@/components/System/Taskbar/TaskbarEntry';
import { sortByLastRunning } from '@/utils/utils';

export const Taskbar: FC = () => {
  const { apps, focus, minimize } = useContext(AppsContext);

  return (
    <nav className={styles.taskbar}>
      <ol>
        {apps
          ?.sort(sortByLastRunning)
          .map(({ id, icon, minimized, name, foreground, stackOrder }) => (
            <TaskbarEntry
              key={id}
              foreground={foreground}
              icon={icon}
              name={name}
              onClick={() => {
                if (minimized) {
                  minimize?.(id, false);
                } else {
                  const [foregroundApp] = stackOrder;

                  foregroundApp === id ? minimize?.(id) : focus?.(id);
                }
              }}
              tabIndex={0}
            />
          ))}
      </ol>
      <Clock />
    </nav>
  );
};
