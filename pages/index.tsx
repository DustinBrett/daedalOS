import Desktop from '../components/Desktop';
import Icons from '../components/Icons';
import MetaData from '../components/MetaData';
import Taskbar from '../components/Taskbar';
import Windows from '../components/Windows';

import type { WindowType } from '../components/Window';

const windows: Array<WindowType> = [
  {
    id: 1,
    title: 'Example'
  }
];

export default function HomePage() {
  return (
    <>
      <MetaData />
      <Desktop>
        <Windows windows={ windows } />
        <Icons />
        <Taskbar />
      </Desktop>
    </>
  );
};
