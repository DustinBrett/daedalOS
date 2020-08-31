import CommanderKeenIcon from '@/assets/icons/CommanderKeen.png';

import type { FC } from 'react';
import App from '@/contexts/App';
import { DosAppLoader } from '@/components/Dos';

const CommanderKeen: FC = () => (
  <DosAppLoader
    url="/games/Commander_Keen_1_-_Marooned_on_Mars_1990.zip"
    args={['-c', 'CD CKEEN1', '-c', 'KEEN1.EXE']}
  />
);

export default new App({
  component: CommanderKeen,
  icon: CommanderKeenIcon,
  name: 'Commander Keen',
  lockAspectRatio: true,
  hideScrollbars: true
});
