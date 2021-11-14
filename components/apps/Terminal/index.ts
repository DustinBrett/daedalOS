import StyledTerminal from "components/apps/Terminal/StyledTerminal";
import useTerminal from "components/apps/Terminal/useTerminal";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import ContainerComponent from "utils/ContainerComponent";

const Terminal = ({ id }: ComponentProcessProps): JSX.Element =>
  ContainerComponent(id, useTerminal, StyledTerminal);

export default Terminal;
