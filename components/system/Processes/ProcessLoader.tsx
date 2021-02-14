import RenderProcess from 'components/system/Processes/RenderProcess';
import { ProcessConsumer } from 'contexts/process';
import type { Process } from 'types/contexts/process';

const ProcessesReducer = ([id, process]: [string, Process]) => (
  <RenderProcess key={id} {...process} />
);

const ProcessLoader: React.FC = () => (
  <ProcessConsumer>
    {({ processes }) => Object.entries(processes).map(ProcessesReducer)}
  </ProcessConsumer>
);

export default ProcessLoader;
