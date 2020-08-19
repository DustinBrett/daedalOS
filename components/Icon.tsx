import type { FC } from 'react';
import type { App } from '../contexts/Apps';
import styles from '../styles/Icon.module.scss';

export const Icon: FC<App> = ({ icon, name }) => (
  <li className={styles.icon}>
    {icon}
    {name}
  </li>
);
