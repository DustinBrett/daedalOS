import styles from '@/styles/System/Taskbar/StartMenu.module.scss';

import { faWindows } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

// TODO
// - Make start menu its own folder component outside taskbar
// - <ol> needs to be to the right, buttons on left
// - animations
// - On click the button bg color gets lighter
// - Stays lighter until menu goes away
// - hover on start menu has a circle gradient from cursor for 15-20px
// - hover lights up borders of buttons and bg of items
// - START | All Apps | Dustin Brett | Documents | Power
// - Highlight color for icon, text color and left border (4px) for buttons
// - 1px border on right side of button menu
// - Start menu is also transprent but is more blurred and more dark slightly
// - Unfocus/hide start menu when clicking outside start menu

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
