import styles from '@/styles/Icon.module.scss';

import type { FC } from 'react';
import { useDoubleTap } from 'use-double-tap';

type Icon = {
  icon: JSX.Element;
  name: string;
  onDoubleClick: () => void;
  tabIndex: number;
};

// Support PNG icons

export const Icon: FC<Icon> = ({ icon, name, onDoubleClick, tabIndex }) => (
  <li
    className={styles.icon}
    onDoubleClick={onDoubleClick}
    {...useDoubleTap(onDoubleClick)}
    tabIndex={tabIndex}
  >
    <figure>
      {icon}
      <figcaption>{name}</figcaption>
    </figure>
  </li>
);
