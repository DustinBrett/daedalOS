import FilesIcon from '@/assets/icons/Files.png';

import type { FC } from 'react';

import App from '@/contexts/App';

// TODO: Use data from node.fs `ls`

const Files: FC = () => <article>LIST FILES HERE</article>;

export default new App({
  component: Files,
  icon: FilesIcon,
  name: 'Files'
});
