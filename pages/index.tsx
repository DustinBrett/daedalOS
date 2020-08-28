import type { ReactElement } from 'react';
import { useEffect } from 'react';
import { AppsProvider } from '@/contexts/Apps';
import { Desktop } from '@/components/Desktop';
import { Icons } from '@/components/Icons';
import { MetaData } from '@/components/MetaData';
import { Taskbar } from '@/components/Taskbar';
import { Windows } from '@/components/Windows';

const lockDocumentTitle = () => {
  Object.defineProperty(document, 'title', { set: () => {} });
};

export default function HomePage(): ReactElement {
  useEffect(lockDocumentTitle, []);

  return (
    <>
      <MetaData />
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
