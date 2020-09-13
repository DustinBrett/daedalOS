import type { ReactElement } from 'react';

import Metadata from '@/components/Metadata';
import Desktop from '@/components/System/Desktop/Desktop';
import ProcessProvider from '@/contexts/ProcessManager';
import FileProvider from '@/contexts/FileSystem';
import Directory from '@/components/System/Directory/Directory';
import Windows from '@/components/System/Windows/Windows';
import Taskbar from '@/components/System/Taskbar/Taskbar';

// TODO: Session context to replace `foreground, stackOrder, x, y, height, width`

export default function HomePage(): ReactElement {
  return (
    <>
      <Metadata />
      <Desktop>
        <ProcessProvider>
          <FileProvider>
            <Directory path="/desktop" />
            <Windows />
          </FileProvider>
          <Taskbar />
        </ProcessProvider>
      </Desktop>
    </>
  );
}
