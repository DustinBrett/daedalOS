import styles from '@/styles/Apps/Explorer.module.scss';

import type { FC } from 'react';
import type { DirectoryView } from '@/components/System/Directory/Directory';

import { useState } from 'react';
import { useDoubleTap } from 'use-double-tap';

const homeDir = '/';

export const DirectoryList: FC<DirectoryView> = ({
  onDoubleClick,
  cwd,
  entries
}) => {
  const [selected, setSelected] = useState('');

  return (
    <table className={styles.directory}>
      <thead>
        <tr className={styles.emphasis}>
          <td>Name</td>
          <td>Date Modified</td>
          <td>Size</td>
          <td>Kind</td>
        </tr>
      </thead>
      <tbody>
        {cwd !== homeDir && (
          <tr {...(onDoubleClick ? useDoubleTap(onDoubleClick('..')) : {})}>
            <td>..</td>
            <td colSpan={3}></td>
          </tr>
        )}
        {entries.map(
          ({ icon, kind, mtime, name, path, url, size, fullName }) => (
            <tr
              key={path}
              className={selected === path ? styles.selected : ''}
              onClick={() => setSelected(path || '')}
              {...(onDoubleClick
                ? useDoubleTap(onDoubleClick(url, icon, name))
                : {})}
            >
              <td className={styles.emphasis}>
                <img alt={name} src={icon} draggable={false} />
                {fullName}
              </td>
              <td>{mtime}</td>
              <td>{size}</td>
              <td>{kind}</td>
            </tr>
          )
        )}
      </tbody>
    </table>
  );
};
