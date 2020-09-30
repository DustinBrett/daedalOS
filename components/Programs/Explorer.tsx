import styles from '@/styles/Programs/Explorer.module.scss';

import type { AppComponent } from '@/types/utils/programs';

import { basename } from 'path';
import { FileManager } from '@/components/System/FileManager/FileManager';
import ListView from '@/components/System/FileManager/ListView';
import { ProcessContext } from '@/contexts/ProcessManager';

export const loaderOptions = {
  width: 300,
  height: 255,
  bgColor: '#2b2d2f'
};

export const Explorer: React.FC<AppComponent> = ({
  file: { url = '/' } = {}
}) => (
  <ProcessContext.Consumer>
    {({ title }) => (
      <article className={styles.explorer}>
        <FileManager
          path={url}
          render={ListView}
          onChange={(cwd: string) => {
            title('explorer', cwd === '/' ? 'home' : basename(cwd));
          }}
          details
        />
      </article>
    )}
  </ProcessContext.Consumer>
);

export default Explorer;
