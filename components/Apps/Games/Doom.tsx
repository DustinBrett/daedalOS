import DoomIcon from '@/assets/icons/Doom.png';

import type { FC } from 'react';

import App from '@/contexts/App';
import { DosAppLoader, DosAppOptions } from '@/components/Apps/Dos';

const Doom: FC = () => (
  <DosAppLoader url="/games/doom.ZIP" args={['-c', 'DOOM.EXE']} />
);

export default new App({
  component: Doom,
  icon: DoomIcon,
  name: 'Doom',
  ...DosAppOptions
});
