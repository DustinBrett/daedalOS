import styles from '@/styles/System/Taskbar/StartMenu.module.scss';

import FileManager from '@/components/System/FileManager/FileManager';
import MenuView from '@/components/System/FileManager/MenuView';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import { faBars, faList } from '@fortawesome/free-solid-svg-icons';
import { faWindows } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

const StartMenu: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <nav>
      {showMenu && (
        <nav className={styles.menu}>
          <ol className={styles.buttons}>
            <li>
              <figure>
                <FontAwesomeIcon icon={faBars} />
                <figcaption>START</figcaption>
              </figure>
            </li>
            <li>
              <figure className={styles.buttonSelected}>
                <FontAwesomeIcon icon={faList} />
                <figcaption>All Apps</figcaption>
              </figure>
            </li>
            <li>
              <figure>
                <FontAwesomeIcon icon={faFile} />
                <figcaption>Documents</figcaption>
              </figure>
            </li>
          </ol>
          <FileManager
            path="/desktop"
            render={MenuView}
            onChange={(cwd) => !cwd && setShowMenu(false)}
          />
        </nav>
      )}
      <button
        className={`${styles.start} ${showMenu && styles.menuOpen}`}
        type="button"
        title="Start"
        onClick={() => setShowMenu(!showMenu)}
      >
        <FontAwesomeIcon icon={faWindows} />
      </button>
    </nav>
  );
};

export default StartMenu;
