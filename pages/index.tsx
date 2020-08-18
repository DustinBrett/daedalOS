import type { ReactElement } from 'react';

import { Desktop } from '../components/Desktop';
import { Taskbar } from '../components/Taskbar';
// import { AppsProvider } from '../resources/AppsProvider';

// import { Agent, AgentProvider } from '../components/Agent';

// import MetaData from '../components/MetaData';

// import Wallpaper from '../components/Wallpaper';
// import Windows from '../components/Windows';
// import Icons from '../components/Icons';


export default function HomePage(): ReactElement {
  return (
    <Desktop>
      {/* <Icons/> */}
      <Taskbar />
    </Desktop>
  );

    // <AgentProvider>
    //   <AppsProvider>
    //     <MetaData />

    //       <Wallpaper />
    //       <Agent />
    //       <Windows />
    //     </Desktop>
    //   </AppsProvider>
    // </AgentProvider>
};
