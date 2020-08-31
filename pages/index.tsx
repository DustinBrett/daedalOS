import type { ReactElement } from 'react';

import { AppsProvider } from '@/contexts/Apps';
import { Desktop } from '@/components/System/Desktop';
import { Icons } from '@/components/System/Icons';
import { Metadata } from '@/components/Metadata';
import { Taskbar } from '@/components/System/Taskbar';
import { Windows } from '@/components/System/Windows';

export default function HomePage(): ReactElement {
  return (
    <>
      <Metadata />
      <Desktop>
        <AppsProvider>
          <Icons />
          <Taskbar />
          <Windows />
        </AppsProvider>
      </Desktop>
    </>
  );
}
