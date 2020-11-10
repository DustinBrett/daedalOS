import styles from '@/styles/Programs/Explorer.module.scss';

import type { AppComponent } from '@/types/utils/programs';

import FileManager from '@/components/System/FileManager/FileManager';
import ListView from '@/components/System/FileManager/ListView';
import { basename } from 'path';
import { focusClosestFocusableElementFromRef } from '@/utils/elements';
import { ProcessContext } from '@/contexts/ProcessManager';
import { ROOT_DIRECTORY } from '@/utils/constants';
import { useContext, useRef } from 'react';

const Explorer: React.FC<AppComponent> = ({
  id = '',
  file: { url = ROOT_DIRECTORY } = {}
}) => {
  const explorerRef = useRef<HTMLElement>(null);
  const { title } = useContext(ProcessContext);

  return (
    <article className={styles.explorer} ref={explorerRef}>
      <FileManager
        path={url}
        render={ListView}
        onChange={(cwd) => {
          if (cwd) {
            title(id, cwd === ROOT_DIRECTORY ? 'home' : basename(cwd));
            focusClosestFocusableElementFromRef(explorerRef)();
          }
        }}
        details
      />
    </article>
  );
};

export default Explorer;

export const loaderOptions = {
  width: 320,
  height: 275,
  bgColor: '#2b2d2f'
};
