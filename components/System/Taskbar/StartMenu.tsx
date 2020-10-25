import styles from '@/styles/System/Taskbar/StartMenu.module.scss';

import FileManager from '@/components/System/FileManager/FileManager';
import MenuView from '@/components/System/FileManager/MenuView';
import { faWindows } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRef, useState } from 'react';

const buttons = [
  {
    title: 'START',
    alt: 'Expand',
    icon: '\ue700',
    isBold: true
  },
  {
    title: 'All apps',
    icon: '\ue179',
    isView: true
  },
  {
    title: 'Documents',
    icon: '\ue160'
  },
  {
    title: 'Power',
    icon: '\ue7e8'
  }
];

const defaultView = 'All apps';

const StartMenu: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [view, setView] = useState(defaultView);
  const startButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <nav>
      {showMenu && (
        <nav className={styles.menu}>
          <ol className={styles.buttons}>
            {buttons.map(({ alt, icon, isBold, isView, title }) => (
              <li key={title}>
                <figure
                  className={view === title ? styles.buttonSelected : ''}
                  onClick={isView ? () => setView(view) : undefined}
                  title={alt || title}
                >
                  <span data-icon={icon} />
                  <figcaption>
                    {isBold ? <strong>{title}</strong> : title}
                  </figcaption>
                </figure>
              </li>
            ))}
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
