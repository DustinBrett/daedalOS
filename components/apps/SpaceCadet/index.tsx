import ContainerComponent from "components/apps/AppContainer";
import StyledSpaceCadet from "components/apps/SpaceCadet/StyledSpaceCadet";
import useSpaceCadet from "components/apps/SpaceCadet/useSpaceCadet";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { haltEvent } from "utils/functions";

const SpaceCadet: FC<ComponentProcessProps> = ({ id }) =>
  ContainerComponent(
    id,
    useSpaceCadet,
    StyledSpaceCadet,
    <canvas id="canvas" onContextMenu={haltEvent} />
  );

export default SpaceCadet;
