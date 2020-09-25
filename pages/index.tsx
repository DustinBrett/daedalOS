import type { ReactElement } from 'react';

import Metadata from '@/components/Metadata';
import Desktop from '@/components/System/Desktop/Desktop';
import SessionProvider from '@/contexts/SessionManager';
import ProcessProvider from '@/contexts/ProcessManager';
import FileProvider from '@/contexts/FileSystem';
import FileManager from '@/components/System/FileManager/FileManager';
import IconsView from '@/components/System/FileManager/IconsView';
import WindowManager from '@/components/System/WindowManager/WindowManager';
import Taskbar from '@/components/System/Taskbar/Taskbar';

export default function HomePage(): ReactElement {
  return (
    <>
      <Metadata />
      <SessionProvider>
        <ProcessProvider>
          <Desktop>
            <FileProvider>
              <FileManager path="/desktop" render={IconsView} />
              <WindowManager />
            </FileProvider>
            <Taskbar />
          </Desktop>
        </ProcessProvider>
      </SessionProvider>
    </>
  );
}
