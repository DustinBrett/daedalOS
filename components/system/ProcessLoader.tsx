import { ProcessConsumer } from 'contexts/process';
import dynamic from 'next/dynamic';
import type { FC } from 'react';
import type { Process } from 'types/contexts/process';

const Window = dynamic(() => import('components/system/Window'));

const RenderProcess: FC<Process> = ({ Component, hasWindow }) =>
  hasWindow ? (
    <Window>
      <Component />
    </Window>
  ) : (
    <Component />
  );

const ProcessLoader: FC = () => (
  <ProcessConsumer>
    {({ processes }) =>
      Object.entries(processes).map(([id, process]) => (
        <RenderProcess key={id} {...process} />
      ))
    }
  </ProcessConsumer>
);

export default ProcessLoader;
