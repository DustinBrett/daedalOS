import StyledRuffle from "components/apps/Ruffle/StyledRuffle";
import useRuffle from "components/apps/Ruffle/useRuffle";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import ContainerComponent from "utils/ContainerComponent";

const Ruffle = ({ id }: ComponentProcessProps): JSX.Element =>
  ContainerComponent(id, useRuffle, StyledRuffle);

export default Ruffle;
