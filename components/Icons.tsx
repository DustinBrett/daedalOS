import type { FC } from 'react';
import styles from '../styles/Icons.module.scss';
import { AppsContext } from '../contexts/Apps';
import { useContext } from 'react';
import { Icon } from './Icon';

export const Icons: FC = () => {
  const { apps, updateApps } = useContext(AppsContext);

  return (
    <nav className={styles.icons}>
      <ol className={styles.iconEntries}>
        {apps.map((app) => (
          <Icon
            key={app.id}
            icon={app.icon}
            name={app.name}
            onDoubleClick={() => {
              app?.open?.();
              updateApps([...apps]);
            }}
          />
        ))}
      </ol>
    </nav>
  );
};
