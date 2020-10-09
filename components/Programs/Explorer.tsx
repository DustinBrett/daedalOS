import styles from '@/styles/Programs/Explorer.module.scss';

import type { AppComponent } from '@/types/utils/programs';

import FileManager from '@/components/System/FileManager/FileManager';
import ListView from '@/components/System/FileManager/ListView';
import { basename } from 'path';
import { ProcessContext } from '@/contexts/ProcessManager';
import { ROOT_DIRECTORY } from '@/utils/constants';

export const loaderOptions = {
  width: 320,
  height: 275,
  bgColor: '#2b2d2f'
};

const Explorer: React.FC<AppComponent> = ({
  file: { url = ROOT_DIRECTORY } = {}
}) => (
  <ProcessContext.Consumer>
    {({ title }) => (
      <article className={styles.explorer}>
        <FileManager
          path={url}
          render={ListView}
          onChange={(cwd: string) => {
            title('explorer', cwd === ROOT_DIRECTORY ? 'home' : basename(cwd));
          }}
          details
        />
      </article>
    )}
  </ProcessContext.Consumer>
);

export default Explorer;
