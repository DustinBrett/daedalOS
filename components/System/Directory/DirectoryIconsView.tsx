import styles from '@/styles/System/Directory/DirectoryIcons.module.scss';

import type { FC } from 'react';
import type { DirectoryView } from '@/components/System/Directory/Directory.d';

import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ClickHandler } from '@/utils/events';

const desktopIconDragSettings = {
  dragElastic: 0.15,
  dragTransition: { bounceStiffness: 500, bounceDamping: 15 },
  dragMomentum: false
};

const desktopIconMotionSettings = {
  initial: { opacity: 0, y: -100 },
  animate: { opacity: 1, y: 0 },
  transition: {
    y: {
      type: 'spring'
    }
  }
};

export const DirectoryIcons: FC<DirectoryView> = ({
  entries = [],
  onDoubleClick
}) => {
  const navRef = useRef(null);

  return (
    <nav className={styles.directoryIcons} ref={navRef}>
      <ol>
        <AnimatePresence>
          {entries.map(({ icon, name, kind, path, url }) => (
            <motion.li
              key={path}
              className={styles.directoryIcon}
              tabIndex={0}
              title={`${name}${kind ? `\r\nType: ${kind}` : ''}`}
              onClick={
                new ClickHandler({
                  doubleClick: onDoubleClick(path, url, icon, name)
                }).clickHandler
              }
              drag
              dragConstraints={navRef}
              {...desktopIconDragSettings}
              {...desktopIconMotionSettings}
            >
              <figure>
                <img alt={name} src={icon} draggable={false} />
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
