import ContainerComponent from "components/apps/AppContainer";
import StyledDXBall from "components/apps/DX-Ball/StyledDXBall";
import useDXBall from "components/apps/DX-Ball/useDXBall";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";

const DXBall: FC<ComponentProcessProps> = ({ id }) =>
  ContainerComponent(id, useDXBall, StyledDXBall, <canvas id="dx-ball" />);

export default DXBall;
