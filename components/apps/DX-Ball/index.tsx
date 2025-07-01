import { memo } from "react";
import StyledDXBall from "components/apps/DX-Ball/StyledDXBall";
import useDXBall from "components/apps/DX-Ball/useDXBall";
import AppContainer from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { haltEvent } from "utils/functions";

const DXBall: FC<ComponentProcessProps> = ({ id }) => (
  <AppContainer StyledComponent={StyledDXBall} id={id} useHook={useDXBall}>
    <canvas id="dx-ball" onContextMenuCapture={haltEvent} />
  </AppContainer>
);

export default memo(DXBall);
