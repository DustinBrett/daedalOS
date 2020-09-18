import styles from '@/styles/Programs/Explorer.module.scss';

import type { FC } from 'react';
import type { AppComponent } from '@/utils/programs.d';

import { basename } from 'path';
import { Directory } from '@/components/System/Directory/Directory';
import DirectoryListView from '@/components/System/Directory/DirectoryListView';
import { ProcessContext } from '@/contexts/ProcessManager';

export const loaderOptions = {
  width: 300,
  height: 245,
  bgColor: '#2a282b'
};

export const Explorer: FC<AppComponent> = ({ file: { url = '/' } = {} }) => (
  <ProcessContext.Consumer>
    {({ title }) => (
      <article className={styles.explorer}>
        <Directory
          path={url}
          render={DirectoryListView}
          details={true}
          onChange={(cwd: string) => {
            title?.('explorer', cwd === '/' ? 'home' : basename(cwd));
          }}
        />
      </article>
    )}
  </ProcessContext.Consumer>
);

export default Explorer;
