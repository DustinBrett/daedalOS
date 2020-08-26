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
  <li>
    <Rnd
      className={styles.window}
      dragHandleClassName='handle'
      cancel='.cancel'
      default={{
        x: 100,
        y: 45,
        width: 225,
        height: 225
      }}
    >
      <header className='handle'>
        <h1>{name}</h1>
        <nav className='cancel'>
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
      <article>{children}</article>
    </Rnd>
  </li>
);
