import type { FC } from 'react';
import styles from '../styles/Icon.module.scss';

type Icon = {
  icon: JSX.Element;
  name: string;
  onDoubleClick: () => void;
  tabIndex: number;
};

export const Icon: FC<Icon> = ({ icon, name, onDoubleClick, tabIndex }) => (
  <li className={styles.icon} onDoubleClick={onDoubleClick} tabIndex={tabIndex}>
    <figure>
      {icon}
      <figcaption>{name}</figcaption>
    </figure>
  </li>
);
