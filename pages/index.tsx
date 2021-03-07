import Desktop from 'components/system/Desktop';
import FileManager from 'components/system/Files/FileManager';
import ProcessLoader from 'components/system/Processes/ProcessLoader';
import Taskbar from 'components/system/Taskbar';
import { ProcessProvider } from 'contexts/process';

const Home = (): React.ReactElement => (
  <Desktop>
    <ProcessProvider>
      <FileManager directory="/desktop" />
      <Taskbar />
      <ProcessLoader />
    </ProcessProvider>
  </Desktop>
);

export default Home;
