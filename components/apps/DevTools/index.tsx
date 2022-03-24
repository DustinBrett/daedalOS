import ContainerComponent from "components/apps/AppContainer";
import StyledDevTools from "components/apps/DevTools/StyledDevTools";
import useEruda from "components/apps/DevTools/useEruda";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";

const DevTools: FC<ComponentProcessProps> = ({ id }) =>
  ContainerComponent(id, useEruda, StyledDevTools, <div />);

export default DevTools;
