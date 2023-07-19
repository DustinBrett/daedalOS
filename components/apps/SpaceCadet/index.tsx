import StyledSpaceCadet from "components/apps/SpaceCadet/StyledSpaceCadet";
import useSpaceCadet from "components/apps/SpaceCadet/useSpaceCadet";
import AppContainer from "components/system/Apps/AppContainer";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { haltEvent } from "utils/functions";

const SpaceCadet: FC<ComponentProcessProps> = ({ id }) => (
  <AppContainer
    StyledComponent={StyledSpaceCadet}
    id={id}
    useHook={useSpaceCadet}
  >
    <canvas id="canvas" onContextMenu={haltEvent} />
  </AppContainer>
);

export default SpaceCadet;
