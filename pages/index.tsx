import type { ReactElement } from 'react';

import Desktop from '@/components/System/Desktop/Desktop';
import FileManager from '@/components/System/FileManager/FileManager';
import FileProvider from '@/contexts/FileSystem';
import IconsView from '@/components/System/FileManager/IconsView';
import Metadata from '@/components/System/Metadata';
import ProcessProvider from '@/contexts/ProcessManager';
import SessionProvider from '@/contexts/SessionManager';
import Taskbar from '@/components/System/Taskbar/Taskbar';
import WindowManager from '@/components/System/WindowManager/WindowManager';

export default function HomePage(): ReactElement {
  return (
    <>
      <Metadata />
      <SessionProvider>
        <ProcessProvider>
          <FileProvider>
            <Desktop>
              <FileManager path="/desktop" render={IconsView} />
              <WindowManager />
              <Taskbar />
            </Desktop>
          </FileProvider>
        </ProcessProvider>
      </SessionProvider>
    </>
  );
}
