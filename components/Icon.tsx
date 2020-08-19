import type { FC } from 'react';
import type { AppType } from '../contexts/Apps';
import { useContext } from 'react';
import styles from '../styles/Icon.module.scss';
import { AppsContext } from '../contexts/Apps';

export const Icon: FC<AppType> = ({ icon, id, name, selectedIcon }) => {
  const { apps, updateApps } = useContext(AppsContext),
    selectIcon = () => updateApps(apps.map(app => ({ ...app, selectedIcon: app.id === id })));

  return (
    <li className={ `${ styles.icon } ${ selectedIcon && styles.selected }` } onClick={ selectIcon }>
      { icon }
      { name }
    </li>
  );
};
