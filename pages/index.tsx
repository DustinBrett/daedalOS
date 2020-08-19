import type { ReactElement } from 'react';
import { AppsProvider } from '../contexts/Apps';
import { Desktop } from '../components/Desktop';
import { Icons } from '../components/Icons';
import { Taskbar } from '../components/Taskbar';

export default function HomePage(): ReactElement {
  return (
      <Desktop>
        <AppsProvider>
          <Icons />
          <Taskbar />
        </AppsProvider>
      </Desktop>
  );
};
