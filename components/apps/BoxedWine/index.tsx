import { memo } from "react";
import StyledBoxedWine from "components/apps/BoxedWine/StyledBoxedWine";
import useBoxedWine from "components/apps/BoxedWine/useBoxedWine";
import AppContainer from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { haltEvent } from "utils/functions";

const BoxedWine: FC<ComponentProcessProps> = ({ id }) => (
  <AppContainer
    StyledComponent={StyledBoxedWine}
    id={id}
    useHook={useBoxedWine}
  >
    <canvas
      aria-label="BoxedWine"
      id="boxedWineCanvas"
      onContextMenu={haltEvent}
      role="img"
    />
  </AppContainer>
);

export default memo(BoxedWine);
