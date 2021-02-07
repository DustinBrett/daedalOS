import Desktop from 'components/system/Desktop';
import ProcessLoader from 'components/system/ProcessLoader';
import { ProcessProvider } from 'contexts/process';

export default function Home(): React.ReactElement {
  return (
    <Desktop>
      <ProcessProvider>
        <ProcessLoader />
      </ProcessProvider>
    </Desktop>
  );
}
