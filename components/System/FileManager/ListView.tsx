import styles from '@/styles/System/FileManager/ListView.module.scss';

import type { FC } from 'react';
import type { DirectoryView } from '@/components/System/FileManager/FileManager.d';

import { useState } from 'react';
import { ClickHandler } from '@/utils/events';

const homeDir = '/';

// TODO: Create DirectyListEntry
// TODO: Replace custom click handler

export const DirectoryList: FC<DirectoryView> = ({
  entries,
  cwd,
  onDoubleClick
}) => {
  const [selected, setSelected] = useState('');

  return (
    <table className={styles.directory}>
      <thead>
        <tr className={styles.emphasis}>
          <th>Name</th>
          <th>Size</th>
          <th>Kind</th>
        </tr>
      </thead>
      <tbody>
        {cwd !== homeDir && (
          <tr
            className={selected === '..' ? styles.selected : ''}
            onClick={
              new ClickHandler({
                doubleClick: (event) => onDoubleClick(event, { path: '..' })
              }).clickHandler
            }
            onFocus={() => setSelected('..')}
            tabIndex={0}
          >
            <td>..</td>
            <td colSpan={2}></td>
          </tr>
        )}
        {entries.map(({ icon, kind, name, path, url, size, fullName }) => (
          <tr
            className={selected === path ? styles.selected : ''}
            key={path}
            onClick={
              new ClickHandler({
                doubleClick: (event) =>
                  onDoubleClick(event, { path, url, icon, name })
              }).clickHandler
            }
            onFocus={() => setSelected(path)}
            tabIndex={0}
          >
            <td className={styles.emphasis} title={name}>
              <figure>
                <img alt={name} src={icon} draggable={false} />
                <figcaption title={name}>{fullName}</figcaption>
              </figure>
            </td>
            <td>{size}</td>
            <td>{kind}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DirectoryList;
