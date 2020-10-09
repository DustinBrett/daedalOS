import styles from '@/styles/System/Taskbar/StartMenu.module.scss';

import { faWindows } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const StartMenu: React.FC = () => (
  <nav className={styles.start}>
    <FontAwesomeIcon icon={faWindows} />
  </nav>
);

export default StartMenu;
