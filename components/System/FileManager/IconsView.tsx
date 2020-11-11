import styles from '@/styles/System/FileManager/IconsView.module.scss';

import type { DirectoryView } from '@/types/components/System/FileManager/FileManager';

import IconEntry from '@/components/System/FileManager/IconEntry';
import { AnimatePresence } from 'framer-motion';
import { useRef } from 'react';

const DirectoryIcons: React.FC<DirectoryView> = ({
  entries,
  onDoubleClick
}) => {
  const navRef = useRef<HTMLElement>(null);

  return (
    <nav className={styles.directoryIcons} ref={navRef} tabIndex={-1}>
      <ol>
        <AnimatePresence>
          {entries.map(({ icon, name, kind, path, url }) => (
            <IconEntry
              key={path}
              icon={icon}
              name={name}
              kind={kind}
              path={path}
              url={url}
              navRef={navRef}
              onDoubleClick={onDoubleClick}
            />
          ))}
        </AnimatePresence>
      </ol>
    </nav>
  );
};

export default DirectoryIcons;
