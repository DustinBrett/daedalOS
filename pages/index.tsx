import ProcessLoader from 'components/system/ProcessLoader';
import { ProcessProvider } from 'contexts/process';
import type { ReactElement } from 'react';
import { getStartupProcesses } from 'utils/processDirectory';

export default function Home(): ReactElement {
  return (
    <ProcessProvider startupProcesses={getStartupProcesses()}>
      <ProcessLoader />
    </ProcessProvider>
  );
}
