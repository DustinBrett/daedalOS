import type { FC } from 'react';
import styles from '../styles/Desktop.module.scss';

export const Desktop: FC = ({ children }) => {
  return (
    <main className={ styles.desktop }>
      { children }
    </main>
  );
};
