import { memo } from "react";
import StyledSpaceCadet from "components/apps/SpaceCadet/StyledSpaceCadet";
import useSpaceCadet from "components/apps/SpaceCadet/useSpaceCadet";
import AppContainer from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";

const SpaceCadet: FC<ComponentProcessProps> = ({ id }) => (
  <AppContainer
    StyledComponent={StyledSpaceCadet}
    id={id}
    useHook={useSpaceCadet}
  />
);

export default memo(SpaceCadet);
