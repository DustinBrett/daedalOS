import CommanderKeenIcon from '@/assets/icons/CommanderKeen.png';

import type { FC } from 'react';
import App from '@/contexts/App';
import DOS from '@/components/Dos';

const CommanderKeen: FC = () => (
  <DOS
    url="/games/Commander_Keen_1_-_Marooned_on_Mars_1990.zip"
    args={['-c', 'CD CKEEN1', '-c', 'KEEN1.EXE']}
  />
);

export default new App(
  CommanderKeen,
  CommanderKeenIcon,
  'commander_keen',
  'Cmdr Keen'
);
