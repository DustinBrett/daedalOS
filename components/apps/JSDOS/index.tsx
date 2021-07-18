import StyledJSDOS from "components/apps/JSDOS/StyledJSDOS";
import useJSDOS from "components/apps/JSDOS/useJSDOS";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import ContainerComponent from "utils/ContainerComponent";

const JSDOS = ({ id }: ComponentProcessProps): JSX.Element =>
  ContainerComponent(id, useJSDOS, StyledJSDOS);

export default JSDOS;
