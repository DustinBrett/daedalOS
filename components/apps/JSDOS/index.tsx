import ContainerComponent from "components/apps/AppContainer";
import StyledJSDOS from "components/apps/JSDOS/StyledJSDOS";
import useJSDOS from "components/apps/JSDOS/useJSDOS";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";

const JSDOS = ({ id }: ComponentProcessProps): JSX.Element =>
  ContainerComponent(id, useJSDOS, StyledJSDOS);

export default JSDOS;
