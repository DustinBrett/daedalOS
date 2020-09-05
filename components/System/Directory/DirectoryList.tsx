import styles from '@/styles/Apps/Explorer.module.scss';

import type { FC } from 'react';
import type { DirectoryView } from '@/components/System/Directory/Directory';

import { useState } from 'react';
import { resolve } from 'path';

const homeDir = '/';

const openFile = (path: string) => {
  console.log('OPEN FILE: ' + path);
};

const PreviousDir: FC<{ cwd: string; cd: (dir: string) => void }> = ({
  cwd,
  cd
}) => (
  <tr onDoubleClick={() => cd(resolve(cwd, '..'))}>
    <td>..</td>
    <td colSpan={3}></td>
  </tr>
);

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
        {cwd !== homeDir && <PreviousDir cwd={cwd} cd={cd} />}
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
                isDirectory ? cd(path || '') : openFile(path || '')
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
