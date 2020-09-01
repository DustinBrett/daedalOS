import CommanderKeenIcon from '@/assets/icons/CommanderKeen.png';

import type { FC } from 'react';

import App from '@/contexts/App';
import { DosAppLoader, DosAppOptions } from '@/components/Apps/Dos';

const CommanderKeen: FC = () => (
  <DosAppLoader url="/games/4keen.ZIP" args={['-c', 'KEEN4E.EXE']} />
);

export default new App({
  component: CommanderKeen,
  icon: CommanderKeenIcon,
  name: 'Commander Keen',
  ...DosAppOptions
});
