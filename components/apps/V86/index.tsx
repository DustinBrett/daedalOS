import StyledV86 from "components/apps/V86/StyledV86";
import useV86 from "components/apps/V86/useV86";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import ContainerComponent from "utils/ContainerComponent";

const V86Children: JSX.Element = (
  <>
    <div />
    <canvas />
  </>
);

const V86 = ({ id }: ComponentProcessProps): JSX.Element =>
  ContainerComponent(id, useV86, StyledV86, V86Children);

export default V86;
