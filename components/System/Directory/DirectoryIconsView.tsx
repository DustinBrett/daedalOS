import styles from '@/styles/System/Directory/DirectoryIcons.module.scss';

import type { FC } from 'react';
import type { DirectoryView } from '@/components/System/Directory/Directory.d';

import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ClickHandler } from '@/utils/events';
import {
  desktopIconDragSettings,
  desktopIconMotionSettings
} from '@/utils/motions';

export const DirectoryIcons: FC<DirectoryView> = ({
  entries = [],
  onDoubleClick
}) => {
  const navRef = useRef<HTMLElement>(null);

  return (
    <nav className={styles.directoryIcons} ref={navRef}>
      <ol>
        <AnimatePresence>
          {entries.map(({ icon, name, kind, path, url }) => (
            <motion.li
              key={path}
              className={styles.directoryIcon}
              drag
              dragConstraints={navRef}
              onClick={
                new ClickHandler({
                  doubleClick: onDoubleClick(path, url, icon, name)
                }).clickHandler
              }
              tabIndex={0}
              title={`${name}${kind ? `\r\nType: ${kind}` : ''}`}
              {...desktopIconDragSettings}
              {...desktopIconMotionSettings}
            >
              <figure>
                <img alt={name} draggable={false} src={icon} />
                <figcaption>{name}</figcaption>
              </figure>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
    </nav>
  );
};

export default DirectoryIcons;
