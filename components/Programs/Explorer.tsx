import styles from '@/styles/Programs/Explorer.module.scss';

import type { FC } from 'react';
import type { AppComponent } from '@/utils/programs.d';

import { Directory } from '@/components/System/Directory/Directory';
import DirectoryListView from '@/components/System/Directory/DirectoryListView';

export const loaderOptions = {
  width: 300,
  height: 245,
  bgColor: '#2a282b'
};

export const Explorer: FC<AppComponent> = ({ url = '/' }) => (
  <article className={styles.explorer}>
    <Directory path={url} render={DirectoryListView} details={true} />
  </article>
);

export default Explorer;
