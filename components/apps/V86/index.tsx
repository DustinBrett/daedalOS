import { memo } from "react";
import StyledV86 from "components/apps/V86/StyledV86";
import useV86 from "components/apps/V86/useV86";
import AppContainer from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { haltEvent } from "utils/functions";

const V86: FC<ComponentProcessProps> = ({ id }) => (
  <AppContainer StyledComponent={StyledV86} id={id} useHook={useV86}>
    <div onContextMenuCapture={haltEvent} />
    <canvas onContextMenuCapture={haltEvent} />
  </AppContainer>
);

export default memo(V86);
