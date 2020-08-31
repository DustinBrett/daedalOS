import type { ReactElement } from 'react';

import { useEffect } from 'react';
import { AppsProvider } from '@/contexts/Apps';
import { Desktop } from '@/components/Desktop';
import { Icons } from '@/components/Icons';
import { Metadata } from '@/components/Metadata';
import { Taskbar } from '@/components/Taskbar';
import { Windows } from '@/components/Windows';
import { lockDocumentTitle } from '@/utils';

export default function HomePage(): ReactElement {
  useEffect(lockDocumentTitle, []);

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
