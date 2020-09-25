import styles from '@/styles/Programs/Explorer.module.scss';

import type { FC } from 'react';
import type { AppComponent } from '@/utils/programs.d';

import { basename } from 'path';
import { FileManager } from '@/components/System/FileManager/FileManager';
import ListView from '@/components/System/FileManager/ListView';
import { ProcessContext } from '@/contexts/ProcessManager';

export const loaderOptions = {
  width: 300,
  height: 255,
  bgColor: '#2a282b'
};

export const Explorer: FC<AppComponent> = ({ file: { url = '/' } = {} }) => (
  <ProcessContext.Consumer>
    {({ title }) => (
      <article className={styles.explorer}>
        <FileManager
          path={url}
          render={ListView}
          details={true}
          onChange={(cwd: string) => {
            title('explorer', cwd === '/' ? 'home' : basename(cwd));
          }}
        />
      </article>
    )}
  </ProcessContext.Consumer>
);

export default Explorer;
