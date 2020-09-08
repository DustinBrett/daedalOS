import styles from '@/styles/Apps/Explorer.module.scss';

import type { FC } from 'react';

import { AppComponent } from '@/contexts/App';
import { Directory, View } from '@/components/System/Directory/Directory'; // Dynamic import

export const Explorer: FC<AppComponent> = ({ url = '/' }) => (
  <article className={styles.explorer}>
    <Directory path={url} view={View.List} />
  </article>
);
