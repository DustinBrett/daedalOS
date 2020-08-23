import type { FC } from 'react';
import styles from '../styles/Icon.module.scss';

type Icon = {
  icon: JSX.Element;
  name: string;
  onDoubleClick: () => void;
};

export const Icon: FC<Icon> = ({ icon, name, onDoubleClick }) => (
  <li className={styles.icon} onDoubleClick={onDoubleClick}>
    <figure>
      {icon}
      <figcaption>{name}</figcaption>
    </figure>
  </li>
);
