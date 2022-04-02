import ContainerComponent from "components/apps/AppContainer";
import StyledByuu from "components/apps/Byuu/StyledByuu";
import useByuu from "components/apps/Byuu/useByuu";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";

const Byuu: FC<ComponentProcessProps> = ({ id }) =>
  ContainerComponent(id, useByuu, StyledByuu);

export default Byuu;
