import type { ReactElement } from 'react';

import dynamic from 'next/dynamic';

import Metadata from '@/components/Metadata';
import FilesProvider from '@/contexts/Files';

export default function HomePage(): ReactElement {
  const Desktop = dynamic(import('@/components/System/Desktop/Desktop')),
    AppsProvider = dynamic(import('@/contexts/Apps')),
    Directory = dynamic(import('@/components/System/Directory/Directory')),
    Taskbar = dynamic(import('@/components/System/Taskbar/Taskbar')),
    Windows = dynamic(import('@/components/System/Windows/Windows'));

  return (
    <>
      <Metadata />
      <Desktop>
        <FilesProvider>
          <AppsProvider>
            <Directory path="/desktop" />
            <Taskbar />
            <Windows />
          </AppsProvider>
        </FilesProvider>
      </Desktop>
    </>
  );
}
