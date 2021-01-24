import { ProcessConsumer } from 'contexts/process';
import type { FC } from 'react';

const ProcessLoader: FC = () => (
  <ProcessConsumer>
    {({ processes }) =>
      Object.entries(processes).map(([id, { Component }]) => (
        <Component key={id} />
      ))
    }
  </ProcessConsumer>
);

export default ProcessLoader;
