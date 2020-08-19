import type { FC } from 'react';
import { useContext } from 'react';
import { Icon } from './Icon';
import { AppsContext } from '../contexts/Apps';
import styles from '../styles/Icons.module.scss';

export const Icons: FC = () => {
  const { apps } = useContext(AppsContext);

  return (
    <nav className={styles.icons}>
      <ol className={styles.iconEntries}>
        {apps.map((app) => (
          <Icon key={app.id} {...app} />
        ))}
      </ol>
    </nav>
  );
};
