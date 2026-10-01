import { memo } from "react";
import StyledMarked from "components/apps/Marked/StyledMarked";
import useMarked from "components/apps/Marked/useMarked";
import AppContainer from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";

const Marked: FC<ComponentProcessProps> = ({ id }) => (
  <AppContainer id={id} StyledComponent={StyledMarked} useHook={useMarked}>
    <article />
  </AppContainer>
);

export default memo(Marked);
