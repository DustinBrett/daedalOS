import { useState } from 'react';

import { apps as initialApps } from '../resources/apps';

import Desktop from '../components/Desktop';
import Icons from '../components/Icons';
import MetaData from '../components/MetaData';
import Taskbar from '../components/Taskbar';
import Wallpaper from '../components/Wallpaper';
import Windows from '../components/Windows';

export default function HomePage() {
  const [apps, setApps] = useState(initialApps); // Context?

  return (
    <>
      <MetaData />
      <Desktop>
        <Wallpaper />
        <Windows appsState={ [apps, setApps] } />
        <Icons apps={ apps } />
        <Taskbar apps={ apps } />
      </Desktop>
    </>
  );
};
