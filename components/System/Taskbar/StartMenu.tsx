import styles from '@/styles/System/Taskbar/StartMenu.module.scss';

import { faWindows } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

// TODO
// - On click the button bg color gets lighter
// - Stays lighter until menu goes away
// - hover on start menu has a circle gradient from cursor for 15-20px
// - hover lights up borders of buttons and bg of items
// - Highlight color for icon, text color and left border (4px) for buttons
// - 1px border on right side of button menu

const StartMenu: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <nav>
      <ol
        className={styles.menu}
        style={{ display: showMenu ? 'block' : 'none' }}
      />
      <button
        className={styles.start}
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
