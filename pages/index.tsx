import type { ReactElement } from 'react';
import { AppsProvider } from '../contexts/Apps';
import { Desktop } from '../components/Desktop';
import { Icons } from '../components/Icons';
import { MetaData } from '../components/MetaData';
import { Taskbar } from '../components/Taskbar';
import { Wallpaper } from '../components/Wallpaper';

export default function HomePage(): ReactElement {
  return (
    <>
      <MetaData />
      <Desktop>
        <Wallpaper />
        <AppsProvider>
          <Icons />
          <Taskbar />
        </AppsProvider>
      </Desktop>
    </>
  );
}
