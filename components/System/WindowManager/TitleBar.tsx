import styles from '@/styles/System/WindowManager/Window.module.scss';

import type { TitleBarProps } from '@/types/components/System/WindowManager/TitleBar';

import Icon from '@/components/System/Icon';
import { faMinus, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const TitleBar: React.FC<TitleBarProps> = ({
  icon,
  name,
  onMaximize,
  onMinimize,
  onClose
}) => {
  return (
    <header className={`${styles.titlebar} handle`} onDoubleClick={onMaximize}>
      <h1>
        <figure>
          <Icon src={icon} height={16} width={16} />
          <figcaption>{name}</figcaption>
        </figure>
      </h1>
      <nav className="cancel">
        <button id={styles.close} type="button" onClick={onClose}>
          <FontAwesomeIcon size="xs" icon={faTimes} />
        </button>
        <button id={styles.minimize} type="button" onClick={onMinimize}>
          <FontAwesomeIcon size="xs" icon={faMinus} />
        </button>
        <button id={styles.maximize} type="button" onClick={onMaximize}>
          <FontAwesomeIcon size="xs" icon={faPlus} />
        </button>
      </nav>
    </header>
  );
};

export default TitleBar;
