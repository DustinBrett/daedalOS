import { memo } from "react";
import StyledClassiCube from "components/apps/ClassiCube/StyledClassiCube";
import useClassiCube from "components/apps/ClassiCube/useClassiCube";
import AppContainer from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";

const ClassiCube: FC<ComponentProcessProps> = ({ id }) => (
  <AppContainer
    StyledComponent={StyledClassiCube}
    id={id}
    useHook={useClassiCube}
  />
);

export default memo(ClassiCube);
