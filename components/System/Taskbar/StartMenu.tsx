import styles from '@/styles/System/Taskbar/StartMenu.module.scss';

import FileManager from '@/components/System/FileManager/FileManager';
import MenuView from '@/components/System/FileManager/MenuView';
import { faWindows } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRef, useState } from 'react';

const StartMenu: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [view, setView] = useState('All apps');
  const startButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <nav>
      {showMenu && (
        <nav className={styles.menu}>
          <ol className={styles.buttons}>
            <li>
              <figure title="Expand">
                <span data-icon="&#xe700;" />
                <figcaption>
                  <strong>START</strong>
                </figcaption>
              </figure>
            </li>
            <li>
              <figure
                className={view === 'All apps' ? styles.buttonSelected : ''}
                title="All apps"
                onClick={() => setView('All apps')}
              >
                <span data-icon="&#xe179;" />
                <figcaption>All apps</figcaption>
              </figure>
            </li>
            <li>
              <figure title="Documents">
                <span data-icon="&#xe160;" />
                <figcaption>Documents</figcaption>
              </figure>
            </li>
            <li>
              <figure title="Power">
                <span data-icon="&#xe7e8;" />
                <figcaption>Power</figcaption>
              </figure>
            </li>
          </ol>
          <FileManager
            path="/start"
            render={MenuView}
            onChange={(cwd) => !cwd && setShowMenu(false)}
          />
        </nav>
      )}
      <button
        ref={startButtonRef}
        className={`${styles.start} ${showMenu && styles.menuOpen}`}
        type="button"
        title="Start"
        onClick={() => setShowMenu(!showMenu)}
        onBlur={({ relatedTarget }) => {
          if (!relatedTarget) {
            startButtonRef?.current?.focus();
          } else {
            setShowMenu(false);
          }
        }}
      >
        <FontAwesomeIcon icon={faWindows} />
      </button>
    </nav>
  );
};

export default StartMenu;
