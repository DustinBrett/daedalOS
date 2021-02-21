import RenderProcess from 'components/system/Processes/RenderProcess';
import { ProcessConsumer } from 'contexts/process';
import type { Processes } from 'types/contexts/process';

const renderProcesses = (processes: Processes) =>
  Object.entries(processes).map(([id, process]) => (
    <RenderProcess key={id} {...process} />
  ));

const ProcessLoader = (): JSX.Element => (
  <ProcessConsumer>
    {({ processes }) => renderProcesses(processes)}
  </ProcessConsumer>
);

export default ProcessLoader;
