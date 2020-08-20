import type { FC } from 'react';
import type { App } from '../contexts/Apps';
import { AppsContext } from '../contexts/Apps';
import { useContext } from 'react';
import styles from '../styles/Icon.module.scss';

export const Icon: FC<App> = ({ icon, id, name }) => {
  const { apps, updateApps } = useContext(AppsContext),
    openApp = () =>
      updateApps(
        apps.map((app) => (app.id === id ? { ...app, running: true } : app))
      );

  return (
    <li className={styles.icon} onDoubleClick={openApp}>
      {icon}
      {name}
    </li>
  );
};
