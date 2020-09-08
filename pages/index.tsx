import type { ReactElement } from 'react';

import dynamic from 'next/dynamic';

export default function HomePage(): ReactElement {
  const Metadata = dynamic(import('@/components/Metadata')),
    Desktop = dynamic(import('@/components/System/Desktop/Desktop')),
    FilesProvider = dynamic(import('@/contexts/Files')),
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
