import type { ReactElement } from 'react';

// Only use dynamic for things that arent needed on load
// import dynamic from 'next/dynamic';

import Metadata from '@/components/Metadata';
import Desktop from '@/components/System/Desktop/Desktop';
import AppsProvider from '@/contexts/Apps';
import FilesProvider from '@/contexts/Files';
import Directory from '@/components/System/Directory/Directory';
import Windows from '@/components/System/Windows/Windows';
import Taskbar from '@/components/System/Taskbar/Taskbar';

// TODO: Change AppsProvider to ProcessProvider
// TODO: Change FilesProvider to FileProvider

export default function HomePage(): ReactElement {
  return (
    <>
      <Metadata />
      <Desktop>
        <AppsProvider>
          <FilesProvider>
            <Directory path="/desktop" />
            <Windows />
          </FilesProvider>
          <Taskbar />
        </AppsProvider>
      </Desktop>
    </>
  );
}
