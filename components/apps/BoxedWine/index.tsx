import StyledBoxedWine from "components/apps/BoxedWine/StyledBoxedWine";
import useBoxedWine from "components/apps/BoxedWine/useBoxedWine";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import ContainerComponent from "utils/ContainerComponent";

const BoxedWine = ({ id }: ComponentProcessProps): JSX.Element =>
  ContainerComponent(id, useBoxedWine, StyledBoxedWine, <canvas id="canvas" />);

export default BoxedWine;
