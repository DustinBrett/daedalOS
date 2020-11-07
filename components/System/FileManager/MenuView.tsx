import styles from '@/styles/System/FileManager/MenuView.module.scss';

import type { DirectoryView } from '@/types/components/System/FileManager/FileManager';

import Icon from '@/components/System/Icon';
import { AnimatePresence, motion } from 'framer-motion';
import { startMenuEntriesMotionSettings } from '@/utils/motions';

const DirectoryMenu: React.FC<DirectoryView> = ({ entries, onDoubleClick }) => {
  return (
    <ol className={styles.menuView}>
      <AnimatePresence>
        {entries.map(({ icon, name, path, url }) => (
          <motion.li
            key={path}
            onClick={onDoubleClick({ path, url, icon, name })}
            {...startMenuEntriesMotionSettings}
          >
            <figure>
              <div className={styles.menuIcon}>
                <Icon src={icon} height={32} width={32} />
              </div>
              <figcaption>{name}</figcaption>
            </figure>
          </motion.li>
        ))}
      </AnimatePresence>
    </ol>
  );
};

export default DirectoryMenu;
