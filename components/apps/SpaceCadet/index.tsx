import StyledSpaceCadet from "components/apps/SpaceCadet/StyledSpaceCadet";
import useSpaceCadet from "components/apps/SpaceCadet/useSpaceCadet";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { haltEvent } from "components/system/Files/FileManager/functions";
import ContainerComponent from "utils/ContainerComponent";

const SpaceCadet = ({ id }: ComponentProcessProps): JSX.Element =>
  ContainerComponent(
    id,
    useSpaceCadet,
    StyledSpaceCadet,
    <canvas id="canvas" onContextMenu={haltEvent} />
  );

export default SpaceCadet;
