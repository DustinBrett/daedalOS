import styles from '@/styles/System/FileManager/ListView.module.scss';

import type { DirectoryView } from '@/types/components/System/FileManager/FileManager';

import { useState } from 'react';
import DirectyListEntry from '@/components/System/FileManager/DirectyListEntry';
import { ROOT_DIRECTORY } from '@/utils/constants';

const DirectoryList: React.FC<DirectoryView> = ({
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
        {cwd !== ROOT_DIRECTORY && (
          <DirectyListEntry
            selected={selected}
            setSelected={setSelected}
            doubleClick={onDoubleClick({ path: '..' })}
          />
        )}
        {entries.map(({ icon, kind, name, path, url, size, fullName }) => {
          return (
            <DirectyListEntry
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
          );
        })}
      </tbody>
    </table>
  );
};

export default DirectoryList;
