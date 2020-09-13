import type { ReactElement } from 'react';

import Metadata from '@/components/Metadata';
import Desktop from '@/components/System/Desktop/Desktop';
import ProcessProvider from '@/contexts/Process';
import FilesProvider from '@/contexts/Files';
import Directory from '@/components/System/Directory/Directory';
import Windows from '@/components/System/Windows/Windows';
import Taskbar from '@/components/System/Taskbar/Taskbar';

// TODO: Linting .d files

export default function HomePage(): ReactElement {
  return (
    <>
      <Metadata />
      <Desktop>
        <ProcessProvider>
          <FilesProvider>
            <Directory path="/desktop" />
            <Windows />
          </FilesProvider>
          <Taskbar />
        </ProcessProvider>
      </Desktop>
    </>
  );
}
