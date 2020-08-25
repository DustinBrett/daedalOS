import type { FC } from 'react';
import styles from '../styles/Window.module.scss';

type Window = {
  name: string;
  onMinimize: () => void;
  onClose: () => void;
};

export const Window: FC<Window> = ({ children, name, onMinimize, onClose }) => (
  <li className={styles.window}>
    <header>
      <h1>{name}</h1>
      <nav>
        <button id={styles.minimize} onClick={onMinimize}>
          -
        </button>
        <button id={styles.maximize}>+</button>
        <button id={styles.close} onClick={onClose}>
          x
        </button>
      </nav>
    </header>
    <article>{children}</article>
  </li>
);
