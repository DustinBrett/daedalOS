import StyledDevTools from "components/apps/DevTools/StyledDevTools";
import useEruda from "components/apps/DevTools/useEruda";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import ContainerComponent from "utils/ContainerComponent";

const DevTools = ({ id }: ComponentProcessProps): JSX.Element =>
  ContainerComponent(id, useEruda, StyledDevTools, <div />);

export default DevTools;
