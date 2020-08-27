import DosIcon from '@/assets/svg/dos.svg';

import type { FC } from 'react';
import App from '@/contexts/App';
import Dos from '@/components/Dos';

const CommanderKeen1: FC = () => (
  <Dos
    url="/games/Commander_Keen_1_-_Marooned_on_Mars_1990.zip"
    args={['-c', 'CD CKEEN1', '-c', 'KEEN1.EXE']}
  />
);

export default new App(CommanderKeen1, <DosIcon />, 'keen1', 'Keen 1');
