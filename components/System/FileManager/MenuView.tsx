import styles from '@/styles/System/FileManager/MenuView.module.scss';

import type { DirectoryView } from '@/types/components/System/FileManager/FileManager';

import Icon from '@/components/System/Icon';
import { motion } from 'framer-motion';

const DirectoryMenu: React.FC<DirectoryView> = ({ entries, onDoubleClick }) => {
  return (
    <ol className={styles.menuView}>
      {entries.map(({ icon, name, path, url }) => (
        <motion.li
          key={path}
          onClick={onDoubleClick({ path, url, icon, name })}
        >
          <figure>
            <div className={styles.menuIcon}>
              <Icon src={icon} />
            </div>
            <figcaption>{name}</figcaption>
          </figure>
        </motion.li>
      ))}
    </ol>
  );
};

export default DirectoryMenu;
