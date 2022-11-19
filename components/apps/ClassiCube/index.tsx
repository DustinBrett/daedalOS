import AppContainer from "components/apps/AppContainer";
import StyledClassiCube from "components/apps/ClassiCube/StyledClassiCube";
import useClassiCube from "components/apps/ClassiCube/useClassiCube";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";

const ClassiCube: FC<ComponentProcessProps> = ({ id }) => (
  <AppContainer
    StyledComponent={StyledClassiCube}
    id={id}
    useHook={useClassiCube}
  >
    <canvas />
  </AppContainer>
);

export default ClassiCube;
