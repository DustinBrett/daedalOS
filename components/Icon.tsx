import type { FC } from 'react';
import type { AppType } from '../contexts/Apps';
import styles from '../styles/Icon.module.scss';

export const Icon: FC<AppType> = ({ icon, name }) => (
  <li className={styles.icon}>
    {icon}
    {name}
  </li>
);
