import { memo } from "react";
import StyledRuffle from "components/apps/Ruffle/StyledRuffle";
import useRuffle from "components/apps/Ruffle/useRuffle";
import AppContainer from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";

const Ruffle: FC<ComponentProcessProps> = ({ id }) => (
  <AppContainer StyledComponent={StyledRuffle} id={id} useHook={useRuffle} />
);

export default memo(Ruffle);
