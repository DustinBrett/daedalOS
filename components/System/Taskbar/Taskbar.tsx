import styles from '@/styles/System/Taskbar.module.scss';

import { FC, useContext } from 'react';

import dynamic from 'next/dynamic';
import { AppsContext } from '@/contexts/Apps';
import { sortByLastRunning } from '@/utils/utils';

const Clock = dynamic(import('@/components/System/Taskbar/Clock'));
const TaskbarEntry = dynamic(
  import('@/components/System/Taskbar/TaskbarEntry')
);

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
                  const [foregroundApp] = stackOrder; // TODO: Top of stack order doesnt mean its foreground

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

export default Taskbar;
