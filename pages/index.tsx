import type { ReactElement } from 'react';

import { AppsProvider } from '@/contexts/Apps';
import { Desktop } from '@/components/System/Desktop/Desktop';
import { Directory } from '@/components/System/Directory/Directory';
import { Metadata } from '@/components/Metadata';
import { Taskbar } from '@/components/System/Taskbar/Taskbar';
import { Windows } from '@/components/System/Windows/Windows';
import { View } from '@/components/System/Directory/Directory';
import { FilesProvider } from '@/contexts/Files';

export default function HomePage(): ReactElement {
  return (
    <>
      <Metadata />
      <Desktop>
        <AppsProvider>
          <FilesProvider>
            <Directory path="/desktop" view={View.Icons} />
          </FilesProvider>
          <Taskbar />
          <Windows />
        </AppsProvider>
      </Desktop>
    </>
  );
}
