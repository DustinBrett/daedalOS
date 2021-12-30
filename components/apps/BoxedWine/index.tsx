import ContainerComponent from "components/apps/AppContainer";
import StyledBoxedWine from "components/apps/BoxedWine/StyledBoxedWine";
import useBoxedWine from "components/apps/BoxedWine/useBoxedWine";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";

const BoxedWine = ({ id }: ComponentProcessProps): JSX.Element =>
  ContainerComponent(id, useBoxedWine, StyledBoxedWine, <canvas id="canvas" />);

export default BoxedWine;
