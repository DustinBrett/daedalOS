import RenderProcess from 'components/system/Processes/RenderProcess';
import { ProcessConsumer } from 'contexts/process';

const ProcessLoader = (): JSX.Element => (
  <ProcessConsumer>
    {({ mapProcesses }) =>
      mapProcesses(([id, { Component, hasWindow }]) => (
        <RenderProcess
          key={id}
          Component={Component}
          hasWindow={Boolean(hasWindow)}
        />
      ))
    }
  </ProcessConsumer>
);

export default ProcessLoader;
