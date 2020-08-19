import { AppsProvider } from '../contexts/Apps';
import { Desktop } from '../components/Desktop';
import { Icons } from '../components/Icons';
import { Taskbar } from '../components/Taskbar';

export default function HomePage() {
  return (
      <Desktop>
        <AppsProvider>
          <Icons />
          <Taskbar />
        </AppsProvider>
      </Desktop>
  );
};
