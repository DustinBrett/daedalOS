import styles from '@/styles/System/DirectoryIcons.module.scss';

import type { FC } from 'react';
import type { DirectoryView } from '@/components/System/Directory/Directory';
import { ClickHandler } from '@/utils/events';

export const DirectoryIcons: FC<DirectoryView> = ({
  entries = [],
  onDoubleClick
}) => (
  <nav className={styles.directoryIcons}>
    <ol>
      {entries.map(({ icon, name, kind, path, url }) => (
        <li
          key={path}
          className={styles.directoryIcon}
          tabIndex={0}
          title={`${name}${kind ? `\r\nType: ${kind}` : ''}`}
          onClick={
            new ClickHandler({
              doubleClick: onDoubleClick(path, url, icon, name)
            }).clickHandler
          }
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
