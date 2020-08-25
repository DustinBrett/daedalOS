import type { FC } from 'react';
import styles from '../styles/Window.module.scss';

type Window = {
  name: string;
};

export const Window: FC<Window> = ({ children, name }) => (
  <li className={styles.window}>
    <header className={styles.titleBar}>
      <h1 className={styles.title}>{name}</h1>
      <nav className={styles.controls}>
        <button>-</button>
        <button>+</button>
        <button>x</button>
      </nav>
    </header>
    {children}
  </li>
);
