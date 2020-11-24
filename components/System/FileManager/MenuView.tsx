import styles from '@/styles/System/FileManager/MenuView.module.scss';

import type { DirectoryView } from '@/types/components/System/FileManager/FileManager';

import Icon from '@/components/System/Icon';

const DirectoryMenu: React.FC<DirectoryView> = ({ entries, onDoubleClick }) => {
  return (
    <ol className={styles.menuView}>
      {entries.map(({ icon, name, path, url }) => (
        <li key={path} onClick={onDoubleClick({ path, url, icon, name })}>
          <figure>
            <div className={styles.menuIcon}>
              <Icon src={icon} height={32} width={32} />
            </div>
            <figcaption>{name}</figcaption>
          </figure>
        </li>
      ))}
    </ol>
  );
};

export default DirectoryMenu;
