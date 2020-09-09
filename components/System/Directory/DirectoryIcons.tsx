import styles from '@/styles/System/DirectoryIcons.module.scss';

import type { FC } from 'react';
import type { DirectoryView } from '@/components/System/Directory/Directory';

import { ClickHandler } from '@/utils/events';
import Draggable from 'react-draggable';
import { AnimatePresence, motion } from 'framer-motion';

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
}) => (
  <nav className={styles.directoryIcons}>
    <ol>
      <AnimatePresence>
        {entries.map(({ icon, name, kind, path, url }) => (
          <Draggable
            key={path}
          >
            <motion.li
              className={styles.directoryIcon}
              tabIndex={0}
              title={`${name}${kind ? `\r\nType: ${kind}` : ''}`}
              onClick={
                new ClickHandler({
                  doubleClick: onDoubleClick(path, url, icon, name)
                }).clickHandler
              }
              {...desktopIconMotionSettings}
            >
              <figure>
                <img alt={name} src={icon} draggable={false} />
                <figcaption>{name}</figcaption>
              </figure>
            </motion.li>
          </Draggable>
        ))}
      </AnimatePresence>
    </ol>
  </nav>
);

export default DirectoryIcons;
