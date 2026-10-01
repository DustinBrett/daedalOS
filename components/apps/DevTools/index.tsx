import { memo } from "react";
import StyledDevTools from "components/apps/DevTools/StyledDevTools";
import useEruda from "components/apps/DevTools/useEruda";
import AppContainer from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";

const DevTools: FC<ComponentProcessProps> = ({ id }) => (
  <AppContainer id={id} StyledComponent={StyledDevTools} useHook={useEruda}>
    <div />
  </AppContainer>
);

export default memo(DevTools);
