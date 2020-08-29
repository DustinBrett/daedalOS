import DukeNukemIcon from '@/assets/icons/DukeNukem.png';

import type { FC } from 'react';
import App from '@/contexts/App';
import DOS from '@/components/Dos';

const DukeNukem: FC = () => (
  <DOS url="/games/dn3d-box.zip" args={['-c', 'DN3DLOW.BAT']} />
);

export default new App(DukeNukem, DukeNukemIcon, 'duke_nukem', 'Duke Nkm'); // TODO: Duke Nukem
