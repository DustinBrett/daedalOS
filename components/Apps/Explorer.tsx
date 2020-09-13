import styles from '@/styles/Apps/Explorer.module.scss';

import type { FC } from 'react';
import type { AppComponent } from '@/utils/apps.d';

import { Directory } from '@/components/System/Directory/Directory';
import { View } from '@/components/System/Directory/Directory.d';

export const loaderOptions = {
  width: 300,
  height: 245,
  bgColor: '#2a282b'
};

export const Explorer: FC<AppComponent> = ({ url = '/' }) => (
  <article className={styles.explorer}>
    <Directory path={url} view={View.List} />
  </article>
);

export default Explorer;
