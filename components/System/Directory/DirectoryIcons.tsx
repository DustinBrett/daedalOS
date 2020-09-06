import styles from '@/styles/System/DirectoryIcons.module.scss';

import type { FC } from 'react';
import type { DirectoryView } from '@/components/System/Directory/Directory';

import { useDoubleTap } from 'use-double-tap';

export const DirectoryIcons: FC<DirectoryView> = ({
  entries = [],
  onDoubleClick
}) => (
  <nav className={styles.directoryIcons}>
    <ol>
      {entries.map(({ path, icon, name }) => (
        <li
          key={path}
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
      ))}
    </ol>
  </nav>
);
