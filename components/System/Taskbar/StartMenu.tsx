import styles from '@/styles/System/Taskbar/StartMenu.module.scss';

import { faWindows } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

const StartMenu: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <nav className={styles.start} title="Start">
      <ol
        className={styles.menu}
        style={{ display: showMenu ? 'block' : 'none' }}
      />
      <FontAwesomeIcon
        icon={faWindows}
        onClick={() => setShowMenu(!showMenu)}
      />
    </nav>
  );
};

export default StartMenu;
