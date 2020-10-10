import styles from '@/styles/System/Taskbar/StartMenu.module.scss';

import { faWindows } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// TODO:
// - The menu can be <ol>.
// - CSS positionined directly above button
// - 0 height by default
// - animate to 100% height

const StartMenu: React.FC = () => (
  <nav className={styles.start}>
    <FontAwesomeIcon icon={faWindows} />
  </nav>
);

export default StartMenu;
