import styles from '@/styles/System/Icons.module.scss';

import type { FC } from 'react';

import { useContext } from 'react';
import { AppsContext } from '@/contexts/Apps';
import { Icon } from '@/components/System/Icon';
import { newDate } from '@/utils/dateTime';

export const Icons: FC = () => {
  const { apps, updateApp } = useContext(AppsContext);

  return (
    <nav className={styles.icons}>
      <ol>
        {apps.map(({ id, icon, running, name }, index) => (
          <Icon
            key={id}
            icon={icon}
            name={name}
            onDoubleClick={() => {
              updateApp({
                updates: running
                  ? { foreground: true, minimized: false }
                  : { running: true, lastRunning: newDate() },
                id
              });
            }}
            tabIndex={index}
          />
        ))}
      </ol>
    </nav>
  );
};
