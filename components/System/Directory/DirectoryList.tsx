import styles from '@/styles/Apps/Explorer.module.scss';

import type { FC } from 'react';
import type { DirectoryView } from '@/components/System/Directory/Directory';

import { useState } from 'react';
import { resolve } from 'path';

const homeDir = '/'; // TODO: Path func to check if at home

export const DirectoryList: FC<DirectoryView> = ({
  cd = () => {},
  cwd = '',
  entries
}) => {
  const [selected, setSelected] = useState('');

  // TODO: DoubleTap
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
          <tr onDoubleClick={() => cd(resolve(cwd, '..'))}>
            <td>..</td>
            <td colSpan={3}></td>
          </tr>
        )}
        {entries.map(
          ({
            path,
            isDirectory,
            name,
            icon,
            formattedModifiedTime,
            formattedSize,
            kind
          }) => (
            <tr
              key={path}
              className={selected === path ? styles.selected : ''}
              onClick={() => setSelected(path || '')}
              onDoubleClick={() =>
                isDirectory ? cd(path || '') : console.log(path || '')
              }
            >
              <td className={styles.emphasis}>
                <img alt={name} src={icon} draggable={false} />
                {name}
              </td>
              <td>{formattedModifiedTime}</td>
              <td>{formattedSize}</td>
              <td>{kind}</td>
            </tr>
          )
        )}
      </tbody>
    </table>
  );
};
