import type { FC } from 'react';
import styles from '../styles/Windows.module.scss';
import { AppsContext } from '../contexts/Apps';
import { useContext } from 'react';
import { Window } from './Window';

export const Windows: FC = () => {
  const { apps } = useContext(AppsContext);

  return (
    <section className={styles.windows}>
      {apps
        .filter((app) => app.running && !app.minimized)
        .map((app) => (
          <Window key={app.id} name={app.name}>
            {app.component}
          </Window>
        ))}
    </section>
  );
};
