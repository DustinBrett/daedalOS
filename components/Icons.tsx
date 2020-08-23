import type { FC } from 'react';
import type App from '../contexts/App';

import styles from '../styles/Icons.module.scss';

import { Icon } from './Icon';

export const Icons: FC<{ apps: Array<App> }> = ({ apps }) => (
  <nav className={styles.icons}>
    <ol className={styles.iconEntries}>
      {apps.map((app) => (
        <Icon
          key={app.id}
          icon={app.icon}
          name={app.name}
          onDoubleClick={() => {
            console.log('TEST');
            app?.open?.();
          }}
        />
      ))}
    </ol>
  </nav>
);
