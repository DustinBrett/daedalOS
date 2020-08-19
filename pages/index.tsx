import type { ReactElement } from 'react';

import { Desktop } from '../components/Desktop';
import { Taskbar } from '../components/Taskbar';

export default function HomePage(): ReactElement {
  return (
    <Desktop>
      <Taskbar />
    </Desktop>
  );
};
