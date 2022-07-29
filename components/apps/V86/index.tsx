import ContainerComponent from "components/apps/AppContainer";
import StyledV86 from "components/apps/V86/StyledV86";
import useV86 from "components/apps/V86/useV86";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { haltEvent } from "utils/functions";

const V86Children: React.ReactNode = (
  <>
    <div onContextMenuCapture={haltEvent} />
    <canvas onContextMenuCapture={haltEvent} />
  </>
);

const V86: FC<ComponentProcessProps> = ({ id }) =>
  ContainerComponent(id, useV86, StyledV86, V86Children);

export default V86;
