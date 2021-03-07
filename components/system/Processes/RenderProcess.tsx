import dynamic from 'next/dynamic';

const Window = dynamic(() => import('components/system/Window'));

const withWindow = (Component: React.ComponentType) => (
  <Window>
    <Component />
  </Window>
);

type RenderProcessProps = {
  Component: React.ComponentType;
  hasWindow: boolean;
};

const RenderProcess = ({
  Component,
  hasWindow
}: RenderProcessProps): JSX.Element =>
  hasWindow ? withWindow(Component) : <Component />;

export default RenderProcess;
