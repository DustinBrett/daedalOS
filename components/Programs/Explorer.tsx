import styles from '@/styles/Programs/Explorer.module.scss';

import type { FC } from 'react';
import type { AppComponent } from '@/utils/programs.d';

import { basename } from 'path';
import { useContext } from 'react';
import { Directory } from '@/components/System/Directory/Directory';
import DirectoryListView from '@/components/System/Directory/DirectoryListView';
import { ProcessContext } from '@/contexts/ProcessManager';

export const loaderOptions = {
  width: 300,
  height: 245,
  bgColor: '#2a282b'
};

export const Explorer: FC<AppComponent> = ({ url = '/' }) => {
  const { title } = useContext(ProcessContext),
    updateTitleOnChange = (cwd: string) => {
      title?.('explorer', cwd === '/' ? 'home' : basename(cwd));
    };

  return (
    <article className={styles.explorer}>
      <Directory
        path={url}
        render={DirectoryListView}
        details={true}
        onChange={updateTitleOnChange}
      />
    </article>
  );
};

export default Explorer;
