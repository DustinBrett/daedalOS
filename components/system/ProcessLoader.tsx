import Window from 'components/system/Window';
import { ProcessConsumer } from 'contexts/process';
import type { FC } from 'react';

const ProcessLoader: FC = () => (
  <ProcessConsumer>
    {({ processes }) =>
      Object.entries(processes).map(([id, { Component, hasWindow }]) =>
        hasWindow ? (
          <Window key={id}>
            <Component />
          </Window>
        ) : (
          <Component key={id} />
        )
      )
    }
  </ProcessConsumer>
);

export default ProcessLoader;
