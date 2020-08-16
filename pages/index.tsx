import { AppsProvider } from '../resources/AppsProvider';
import { AgentProvider } from '../resources/AgentProvider';

import MetaData from '../components/MetaData';
import Desktop from '../components/Desktop';
import Wallpaper from '../components/Wallpaper';
import Windows from '../components/Windows';
import Icons from '../components/Icons';
import Taskbar from '../components/Taskbar';

export default function HomePage() {
  return (
    <AgentProvider>
      <AppsProvider>
        <MetaData />
        <Desktop>
          <Wallpaper />
          <Windows />
          <Icons/>
          <Taskbar />
        </Desktop>
      </AppsProvider>
    </AgentProvider>
  );
};
