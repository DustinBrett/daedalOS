import type { FC } from 'react';
import styles from '../styles/Window.module.scss';

type Window = {
  name: string;
};

export const Window: FC<Window> = ({ children, name }) => (
  <li className={styles.window}>
    <header>
      <h1>{name}</h1>
      <nav>
        <button id={styles.minimize}>-</button>
        <button id={styles.maximize}>+</button>
        <button id={styles.close}>x</button>
      </nav>
    </header>
    <article>{children}</article>
  </li>
);
