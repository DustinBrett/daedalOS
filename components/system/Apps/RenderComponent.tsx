import dynamic from 'next/dynamic';

const Window = dynamic(() => import('components/system/Window'));

export type ComponentProcessProps = {
  id: string;
};

type RenderComponentProps = {
  Component: React.ComponentType<ComponentProcessProps>;
  hasWindow?: boolean;
  id: string;
};

const RenderComponent = ({
  Component,
  hasWindow = true,
  id
}: RenderComponentProps): JSX.Element =>
  hasWindow ? (
    <Window id={id}>
      <Component id={id} />
    </Window>
  ) : (
    <Component id={id} />
  );

export default RenderComponent;
