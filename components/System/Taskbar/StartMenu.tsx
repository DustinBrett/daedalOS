import styles from '@/styles/System/Taskbar/StartMenu.module.scss';

import ButtonBar from '@/components/System/Taskbar/ButtonBar';
import FileManager from '@/components/System/FileManager/FileManager';
import MenuView from '@/components/System/FileManager/MenuView';
import { createPortal } from 'react-dom';
import { faWindows } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getNextContainerElement } from '@/utils/elements';
import { useEffect, useRef, useState } from 'react';

const StartMenu: React.FC<{
  taskbarRef: React.RefObject<HTMLElement>;
}> = ({ taskbarRef }) => {
  const [showMenu, setShowMenu] = useState(false);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const buttonsRef = useRef<HTMLOListElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return mounted
    ? createPortal(
        <>
          {showMenu && (
            <nav className={styles.menu} ref={menuRef} tabIndex={-1}>
              <ButtonBar
                startButtonRef={startButtonRef}
                buttonsRef={buttonsRef}
                setShowMenu={setShowMenu}
              />
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
              if (
                taskbarRef.current === relatedTarget ||
                menuRef.current?.contains(relatedTarget as Node)
              ) {
                startButtonRef?.current?.focus();
              } else if (!buttonsRef.current?.contains(relatedTarget as Node)) {
                setShowMenu(false);
              }
            }}
          >
            <FontAwesomeIcon icon={faWindows} />
          </button>
        </>,
        getNextContainerElement()
      )
    : null;
};

export default StartMenu;
