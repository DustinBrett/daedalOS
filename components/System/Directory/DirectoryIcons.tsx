import styles from '@/styles/System/DirectoryIcons.module.scss';

import type { FC } from 'react';
import type { DirectoryView } from '@/components/System/Directory/Directory';

import { DirectoryIcon } from '@/components/System/Directory/DirectoryIcon';

// onDoubleClick={() => {
//   running
//       ? { foreground: true, minimized: false }
//       : { running: true, lastRunning: newDate() },
// }}

export const DirectoryIcons: FC<DirectoryView> = ({ entries = [] }) => (
  <nav className={styles.directoryIcons}>
    <ol>
      {entries.map(({ id, icon, name }) => (
        <DirectoryIcon
          key={id}
          icon={icon}
          name={name}
          onDoubleClick={() => {
            console.log('onDoubleClick (Icon View)');
          }}
        />
      ))}
    </ol>
  </nav>
);
