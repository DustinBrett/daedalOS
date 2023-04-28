import AppContainer from "components/apps/AppContainer";
import StyledV86 from "components/apps/V86/StyledV86";
import useV86 from "components/apps/V86/useV86";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { haltEvent } from "utils/functions";

const V86: FC<ComponentProcessProps> = ({ id }) => (
  <AppContainer StyledComponent={StyledV86} id={id} useHook={useV86}>
    <div onContextMenuCapture={haltEvent} />
    <canvas onContextMenuCapture={haltEvent} />
  </AppContainer>
);

export default V86;
