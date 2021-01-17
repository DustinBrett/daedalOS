import { ProcessConsumer } from 'contexts/process';
import type { FC } from 'react';

const WindowManager: FC = () => (
  <ProcessConsumer>
    {({ processes }) =>
      Object.entries(processes).map(([id, { Component }]) => (
        <Component key={id} />
      ))
    }
  </ProcessConsumer>
);

export default WindowManager;
