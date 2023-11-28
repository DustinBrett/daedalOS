import dynamic from "next/dynamic";
import { memo } from "react";
import { ErrorBoundary } from "components/pages/ErrorBoundary";
import ComponentError from "components/system/Apps/ComponentError";

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

export default memo(RenderComponent);
