import RenderProcess from 'components/system/Processes/RenderProcess';
import { ProcessConsumer } from 'contexts/process';

const ProcessLoader: React.FC = () => (
  <ProcessConsumer>
    {({ processes }) =>
      Object.entries(processes).map(([id, process]) => (
        <RenderProcess key={id} {...process} />
      ))
    }
  </ProcessConsumer>
);

export default ProcessLoader;
