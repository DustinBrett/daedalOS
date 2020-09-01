import styles from '@/styles/System/Icons.module.scss';

import type { FC } from 'react';

import { useContext } from 'react';
import { AppsContext } from '@/contexts/Apps';
import { Icon } from '@/components/System/Icon';

export const Icons: FC = () => {
  const { apps, updateApp } = useContext(AppsContext);

  return (
    <nav className={styles.icons}>
      <ol>
        {apps.map(({ id, icon, name }, index) => (
          <Icon
            key={id}
            icon={icon}
            name={name}
            onDoubleClick={() => {
              updateApp({
                updates: { running: true, lastRunning: new Date() },
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
