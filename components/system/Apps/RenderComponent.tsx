import { ErrorBoundary } from "components/pages/ErrorBoundary";
import ComponentError from "components/system/Apps/ComponentError";
import dynamic from "next/dynamic";

const Window = dynamic(() => import("components/system/Window"));

export type ComponentProcessProps = {
  id: string;
};

type RenderComponentProps = {
  Component: React.ComponentType<ComponentProcessProps>;
  hasWindow?: boolean;
  id: string;
};

const RenderComponent: FC<RenderComponentProps> = ({
  Component,
  hasWindow = true,
  id,
}) => {
  const SafeComponent = (
    <ErrorBoundary FallbackRender={<ComponentError />}>
      <Component id={id} />
    </ErrorBoundary>
  );

  return hasWindow ? <Window id={id}>{SafeComponent}</Window> : SafeComponent;
};

export default RenderComponent;
