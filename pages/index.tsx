import type { ReactElement } from 'react';

import { Desktop } from '../components/Desktop';
// import { Icons } from '../components/Icons';
import { Taskbar } from '../components/Taskbar';

export default function HomePage(): ReactElement {
  return (
    <Desktop>
      {/* <Icons/> */}
      <Taskbar />
    </Desktop>
  );
};
