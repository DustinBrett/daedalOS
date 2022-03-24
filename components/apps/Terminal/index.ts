import ContainerComponent from "components/apps/AppContainer";
import StyledTerminal from "components/apps/Terminal/StyledTerminal";
import useTerminal from "components/apps/Terminal/useTerminal";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";

const Terminal: FC<ComponentProcessProps> = ({ id }) =>
  ContainerComponent(id, useTerminal, StyledTerminal);

export default Terminal;
