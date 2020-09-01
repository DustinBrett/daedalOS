import styles from '@/styles/System/Icon.module.scss';

import type { FC } from 'react';
import type App from '@/contexts/App';
import type { AppComponent } from '@/contexts/App';

import { useDoubleTap } from 'use-double-tap';

export const Icon: FC<Partial<App> & AppComponent> = ({
  icon,
  name,
  onDoubleClick,
  tabIndex
}) => (
  <li
    className={styles.icon}
    onDoubleClick={onDoubleClick}
    {...(onDoubleClick ? useDoubleTap(onDoubleClick) : {})}
    tabIndex={tabIndex}
  >
    <figure>
      <img alt={name} src={icon} draggable={false} />
      <figcaption>{name}</figcaption>
    </figure>
  </li>
);
