import styles from '@/styles/System/Taskbar/StartMenu.module.scss';

import FileManager from '@/components/System/FileManager/FileManager';
import MenuView from '@/components/System/FileManager/MenuView';
import { createPortal } from 'react-dom';
import { faWindows } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NEXT_ID } from '@/utils/constants';
import { ProcessContext } from '@/contexts/ProcessManager';
import { SessionContext } from '@/contexts/SessionManager';
import { useContext, useEffect, useRef, useState } from 'react';

const defaultView = 'All apps';

const StartMenu: React.FC = () => {
  const { open } = useContext(ProcessContext);
  const { foreground } = useContext(SessionContext);
  const [showMenu, setShowMenu] = useState(false);
  const [view, setView] = useState(defaultView);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const buttonsRef = useRef<HTMLOListElement>(null);
  const nextRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

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
      icon: '\ue160',
      onClick: async (
        clickEvent: React.MouseEvent<HTMLElement, MouseEvent>
      ) => {
        const processId = await open(
          {
            icon: '/icons/programs/explorer.png',
            name: 'Documents',
            url: '/docs'
          },
          {},
          clickEvent.target
        );
        foreground(processId);
        setShowMenu(false);
      }
    },
    {
      title: 'Power',
      icon: '\ue7e8'
    }
  ];

  useEffect(() => {
    nextRef.current = document.getElementById(NEXT_ID);
    setMounted(true);
  }, []);

  return mounted
    ? createPortal(
        <nav>
          {showMenu && (
            <nav className={styles.menu}>
              <ol
                className={styles.buttons}
                ref={buttonsRef}
                tabIndex={-1}
                onMouseLeave={() => startButtonRef.current?.focus()}
              >
                {buttons.map(
                  ({ alt, icon, isBold, isView, title, onClick }) => (
                    <li key={title}>
                      <figure
                        className={view === title ? styles.buttonSelected : ''}
                        onClick={isView ? () => setView(view) : onClick}
                        tabIndex={-1}
                        title={alt || title}
                      >
                        <span data-icon={icon} />
                        <figcaption>
                          {isBold ? <strong>{title}</strong> : title}
                        </figcaption>
                      </figure>
                    </li>
                  )
                )}
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
              } else if (!buttonsRef.current?.contains(relatedTarget as Node)) {
                setShowMenu(false);
              }
            }}
          >
            <FontAwesomeIcon icon={faWindows} />
          </button>
        </nav>,
        nextRef.current as HTMLElement
      )
    : null;
};

export default StartMenu;
