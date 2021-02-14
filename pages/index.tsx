import Desktop from 'components/system/Desktop';
import ProcessLoader from 'components/system/Processes/ProcessLoader';
import { ProcessProvider } from 'contexts/process';

const Home = (): React.ReactElement => (
  <Desktop>
    <ProcessProvider>
      <ProcessLoader />
    </ProcessProvider>
  </Desktop>
);

export default Home;
