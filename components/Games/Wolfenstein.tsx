import WolfensteinIcon from '@/assets/icons/Wolfenstein.png';

import type { FC } from 'react';
import App from '@/contexts/App';
import DOS from '@/components/Dos';

const Wolfenstein: FC = () => (
  <DOS
    url="/games/Wolfenstein3D.zip"
    args={['-c', 'CD CKEEN1', '-c', 'WOLF3D.EXE']}
  />
);

export default new App(
  Wolfenstein,
  WolfensteinIcon,
  'wolfenstein',
  'Wolfenstein'
);
