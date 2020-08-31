import styles from '@/styles/Icons.module.scss';

import type { FC } from 'react';

import { useContext } from 'react';
import { AppsContext } from '@/contexts/Apps';
import { Icon } from '@/components/Icon';

export const Icons: FC = () => {
  const { apps, updateApps } = useContext(AppsContext);

  return (
    <nav className={styles.icons}>
      <ol>
        {apps.map(({ id, icon, name }, index) => (
          <Icon
            key={id}
            icon={icon}
            name={name}
            onDoubleClick={() => {
              updateApps({ update: { running: true }, id });
              updateApps({ update: { lastRunning: new Date() }, id });
            }}
            tabIndex={index}
          />
        ))}
      </ol>
    </nav>
  );
};
