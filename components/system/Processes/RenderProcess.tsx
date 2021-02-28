import dynamic from 'next/dynamic';
import type { Process } from 'types/contexts/process';

const Window = dynamic(() => import('components/system/Window'));

const withWindow = (Component: React.ComponentType) => (
  <Window>
    <Component />
  </Window>
);

const RenderProcess = ({ Component, hasWindow }: Process): JSX.Element =>
  hasWindow ? withWindow(Component) : <Component />;

export default RenderProcess;
