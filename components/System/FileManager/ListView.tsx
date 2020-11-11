import styles from '@/styles/System/FileManager/ListView.module.scss';

import type { DirectoryView } from '@/types/components/System/FileManager/FileManager';

import ListEntry from '@/components/System/FileManager/ListEntry';
import { ROOT_DIRECTORY } from '@/utils/constants';
import { useRef, useState } from 'react';

const DirectoryList: React.FC<DirectoryView> = ({
  cwd,
  entries,
  onDoubleClick
}) => {
  const [selected, setSelected] = useState('');
  const tableContainerRef = useRef<HTMLElement>(null);

  return (
    <article
      className={styles.directoryContainer}
      onFocus={(event) => {
        if (event.target === tableContainerRef.current) {
          setSelected('');
        }
      }}
      ref={tableContainerRef}
      tabIndex={-1}
    >
      <table
        className={styles.directory}
        onBlur={(event) => {
          if (event.relatedTarget === tableContainerRef.current) {
            setSelected('');
          }
        }}
      >
        <thead>
          <tr className={styles.emphasis}>
            <th>Name</th>
            <th>Size</th>
            <th>Kind</th>
          </tr>
        </thead>
        <tbody>
          {cwd !== ROOT_DIRECTORY && (
            <ListEntry
              selected={selected}
              setSelected={setSelected}
              doubleClick={onDoubleClick({ path: '..' })}
            />
          )}
          {entries.map(({ icon, kind, name, path, url, size, fullName }) => (
            <ListEntry
              key={path}
              path={path}
              icon={icon}
              kind={kind}
              size={size}
              fullName={fullName}
              selected={selected}
              setSelected={setSelected}
              doubleClick={onDoubleClick({ path, url, icon, name })}
            />
          ))}
        </tbody>
      </table>
    </article>
  );
};

export default DirectoryList;
