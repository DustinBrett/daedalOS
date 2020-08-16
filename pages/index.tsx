import { AppsProvider } from '../resources/AppsProvider';

import { Agent, AgentProvider } from '../components/Agent';

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
          <Agent />
          <Icons/>
          <Windows />
          <Taskbar />
        </Desktop>
      </AppsProvider>
    </AgentProvider>
  );
};
