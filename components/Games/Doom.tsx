import DoomIcon from '@/assets/icons/Doom.png';

import type { FC } from 'react';
import App from '@/contexts/App';
import DOS from '@/components/Dos';

const Doom: FC = () => <DOS url="/games/doom.ZIP" args={['-c', 'DOOM.EXE']} />;

export default new App(Doom, DoomIcon, 'doom', 'Doom');
