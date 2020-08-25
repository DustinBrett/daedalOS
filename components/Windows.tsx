import type { FC } from 'react';
import styles from '../styles/Windows.module.scss';
import { AppsContext } from '../contexts/Apps';
import { useContext } from 'react';
import { Window } from './Window';

export const Windows: FC = () => {
  const { apps } = useContext(AppsContext);

  return (
    <section className={styles.windows}>
      <ol>
        {apps
          .filter(({ running, minimized }) => running && !minimized)
          .map(({ component: App, id, name }) => (
            <Window key={id} name={name}>
              <App />
            </Window>
          ))}
      </ol>
    </section>
  );
};
