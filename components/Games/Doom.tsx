import DoomIcon from '@/assets/icons/Doom.png';

import type { FC } from 'react';

import App from '@/contexts/App';
import { DosAppLoader } from '@/components/Dos';

const Doom: FC = () => (
  <DosAppLoader url="/games/doom.ZIP" args={['-c', 'DOOM.EXE']} />
);

export default new App({
  component: Doom,
  icon: DoomIcon,
  name: 'Doom',
  lockAspectRatio: true,
  hideScrollbars: true
});
