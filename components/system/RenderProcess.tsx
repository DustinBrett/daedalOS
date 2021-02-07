import dynamic from 'next/dynamic';
import type { Process } from 'types/contexts/process';

const Window = dynamic(() => import('components/system/Window'));

const RenderProcess: React.FC<Process> = ({ Component, hasWindow }) =>
  hasWindow ? (
    <Window>
      <Component />
    </Window>
  ) : (
    <Component />
  );

export default RenderProcess;
