import styles from '@/styles/System/DirectoryIcon.module.scss';

import type { FC } from 'react';
import type { DirectoryEntry } from '@/components/System/Directory/Directory';

import { useDoubleTap } from 'use-double-tap';

// TODO: Combine with DirectoryIcons

export const DirectoryIcon: FC<DirectoryEntry> = ({
  icon,
  name,
  onDoubleClick
}) => (
  <li
    className={styles.directoryIcon}
    onDoubleClick={onDoubleClick}
    {...(onDoubleClick ? useDoubleTap(onDoubleClick) : {})}
    tabIndex={0}
  >
    <figure>
      <img alt={name} src={icon} draggable={false} />
      <figcaption>{name}</figcaption>
    </figure>
  </li>
);
