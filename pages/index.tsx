import Desktop from '../components/Desktop';
import Icons from '../components/Icons';
import MetaData from '../components/MetaData';
import Taskbar from '../components/Taskbar';
import Windows from '../components/Windows';

export default function HomePage() {
  return (
    <>
      <MetaData />
      <Desktop>
        <Windows />
        <Icons />
        <Taskbar />
      </Desktop>
    </>
  );
};
