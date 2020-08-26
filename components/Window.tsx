import type { FC } from 'react';
import { Rnd } from 'react-rnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMinusCircle,
  faPlusCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/Window.module.scss';

type Window = {
  name: string;
  onMinimize: () => void;
  onClose: () => void;
};

export const Window: FC<Window> = ({ children, name, onMinimize, onClose }) => (
  <li className={styles.window}>
    <Rnd
      style={{ background: '#f0f0f0' }}
      dragHandleClassName="handle"
      default={{
        x: 0,
        y: 0,
        width: 200,
        height: 200
      }}
    >
      <div>
        <div className="handle">Drag from here</div>
        <div>This readme is really dragging on...</div>
      </div>
      {/* <header>
        <h1>{name}</h1>
        <nav>
          <button id={styles.minimize} onClick={onMinimize}>
            <FontAwesomeIcon icon={faMinusCircle} />
          </button>
          <button id={styles.maximize}>
            <FontAwesomeIcon icon={faPlusCircle} />
          </button>
          <button id={styles.close} onClick={onClose}>
            <FontAwesomeIcon icon={faTimesCircle} />
          </button>
        </nav>
      </header>
      <article>{children}</article> */}
    </Rnd>
  </li>
);
