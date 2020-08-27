import DosIcon from '@/assets/svg/dos.svg';

import type { FC } from 'react';
import App from '@/contexts/App';
import Dos from '@/components/Dos';

const Doom: FC = () => (
  <Dos
    url="/games/doom.ZIP"
    args={['-c', 'DOOM.EXE']}
  />
);

export default new App(Doom, <DosIcon />, 'doom', 'Doom');
