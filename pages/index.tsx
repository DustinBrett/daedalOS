import AppsLoader from 'components/system/Apps/AppsLoader';
import Desktop from 'components/system/Desktop';
import FileManager from 'components/system/Files/FileManager';
import Taskbar from 'components/system/Taskbar';
import { ProcessProvider } from 'contexts/process';

const Home = (): React.ReactElement => (
  <Desktop>
    <ProcessProvider>
      <FileManager directory="/desktop" />
      <Taskbar />
      <AppsLoader />
    </ProcessProvider>
  </Desktop>
);

export default Home;
