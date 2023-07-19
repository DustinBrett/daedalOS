import StyledClassiCube from "components/apps/ClassiCube/StyledClassiCube";
import useClassiCube from "components/apps/ClassiCube/useClassiCube";
import AppContainer from "components/system/Apps/AppContainer";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { haltEvent } from "utils/functions";

const ClassiCube: FC<ComponentProcessProps> = ({ id }) => (
  <AppContainer
    StyledComponent={StyledClassiCube}
    id={id}
    useHook={useClassiCube}
  >
    <canvas onContextMenu={haltEvent} />
  </AppContainer>
);

export default ClassiCube;
