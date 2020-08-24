import type { FC } from 'react';
import styles from '../styles/Window.module.scss';

type Window = {
  name: string;
};

export const Window: FC<Window> = ({ name }) => (
  <article className={styles.window}>{name}</article>
);
