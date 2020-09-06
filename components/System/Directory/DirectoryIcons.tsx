import styles from '@/styles/System/DirectoryIcons.module.scss';

import type { FC } from 'react';
import type { DirectoryView } from '@/components/System/Directory/Directory';

// import { useDoubleTap } from 'use-double-tap';

export const DirectoryIcons: FC<DirectoryView> = ({
  entries = [],
  onDoubleClick
}) => (
  <nav className={styles.directoryIcons}>
    <ol>
      {entries.map(({ icon, name, path, url }) => (
        <li
          key={path}
          className={styles.directoryIcon}
          onDoubleClick={onDoubleClick(path, url, icon, name)}
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
