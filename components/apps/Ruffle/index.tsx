import ContainerComponent from "components/apps/AppContainer";
import StyledRuffle from "components/apps/Ruffle/StyledRuffle";
import useRuffle from "components/apps/Ruffle/useRuffle";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";

const Ruffle: FC<ComponentProcessProps> = ({ id }) =>
  ContainerComponent(id, useRuffle, StyledRuffle);

export default Ruffle;
