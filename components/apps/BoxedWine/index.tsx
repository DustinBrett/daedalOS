import AppContainer from "components/apps/AppContainer";
import StyledBoxedWine from "components/apps/BoxedWine/StyledBoxedWine";
import useBoxedWine from "components/apps/BoxedWine/useBoxedWine";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { haltEvent } from "utils/functions";

const BoxedWine: FC<ComponentProcessProps> = ({ id }) => (
  <AppContainer
    StyledComponent={StyledBoxedWine}
    id={id}
    useHook={useBoxedWine}
  >
    <canvas id="boxedWineCanvas" onContextMenu={haltEvent} />
  </AppContainer>
);

export default BoxedWine;
