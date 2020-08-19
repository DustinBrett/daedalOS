import type { FC } from 'react';
import { useContext } from 'react';
import { AppsContext } from '../contexts/Apps';
import styles from '../styles/Desktop.module.scss';

export const Desktop: FC = ({ children }) => {
  const { apps, updateApps } = useContext(AppsContext),
    clearSelection = () => updateApps(apps.map(app => ({ ...app, selectedIcon: false })));

  return (
    <main className={ styles.desktop } onClick={ clearSelection }>
      { children }
    </main>
  );
};
