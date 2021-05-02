import RenderProcess from 'components/system/Processes/RenderProcess';
import { ProcessConsumer } from 'contexts/process';

const ProcessLoader = (): JSX.Element => (
  <ProcessConsumer>
    {({ processes }) =>
      Object.entries(processes).map(([id, { Component, hasWindow }]) => (
        <RenderProcess
          key={id}
          Component={Component}
          hasWindow={hasWindow}
          id={id}
        />
      ))
    }
  </ProcessConsumer>
);

export default ProcessLoader;
