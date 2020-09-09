import styles from '@/styles/Apps/Explorer.module.scss';

import type { FC } from 'react';
import type { AppComponent } from '@/contexts/App';

import { Directory, View } from '@/components/System/Directory/Directory';

export const Explorer: FC<AppComponent> = ({ url = '/' }) => (
  <article className={styles.explorer}>
    <Directory path={url} view={View.List} />
  </article>
);

export default Explorer;
