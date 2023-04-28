import AppContainer from "components/apps/AppContainer";
import StyledRuffle from "components/apps/Ruffle/StyledRuffle";
import useRuffle from "components/apps/Ruffle/useRuffle";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";

const Ruffle: FC<ComponentProcessProps> = ({ id }) => (
  <AppContainer StyledComponent={StyledRuffle} id={id} useHook={useRuffle} />
);

export default Ruffle;
