import styles from '@/styles/Apps/Explorer.module.scss';

import type { FC } from 'react';

import { AppComponent } from '@/contexts/App';
import { Directory, View } from '@/components/System/Directory/Directory';

// TODO: Allow specifying path here (url)

const Explorer: FC<AppComponent> = () => (
  <article className={styles.explorer}>
    <Directory path="/" view={View.List} />
  </article>
);

// export default new App({
//   component: Explorer,
//   icon: ExplorerIcon,
//   name: 'Explorer',
//   width: 450,
//   height: 225
// });
