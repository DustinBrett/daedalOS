import type { ReactElement } from 'react';

import Metadata from '@/components/Metadata';
import Desktop from '@/components/System/Desktop';
import SessionProvider from '@/contexts/SessionManager';
import ProcessProvider from '@/contexts/ProcessManager';
import FileProvider from '@/contexts/FileSystem';
import Directory from '@/components/System/Directory/Directory';
import DirectoryIconsView from '@/components/System/Directory/DirectoryIconsView';
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
              <Directory path="/desktop" render={DirectoryIconsView} />
              <WindowManager />
            </FileProvider>
            <Taskbar />
          </Desktop>
        </ProcessProvider>
      </SessionProvider>
    </>
  );
}
