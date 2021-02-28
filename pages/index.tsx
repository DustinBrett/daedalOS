import Desktop from 'components/system/Desktop';
import ProcessLoader from 'components/system/Processes/ProcessLoader';
import Taskbar from 'components/system/Taskbar';
import { ProcessProvider } from 'contexts/process';

const Home = (): React.ReactElement => (
  <Desktop>
    <ProcessProvider>
      <Taskbar />
      <ProcessLoader />
    </ProcessProvider>
  </Desktop>
);

export default Home;
