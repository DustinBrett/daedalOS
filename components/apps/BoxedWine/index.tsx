import StyledBoxedWine from "components/apps/BoxedWine/StyledBoxedWine";
import useBoxedWine from "components/apps/BoxedWine/useBoxedWine";
import AppContainer, {
  useAppContainer,
} from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { haltEvent } from "utils/functions";

const BoxedWine: FC<ComponentProcessProps> = ({ id }) => {
  const containerProps = useAppContainer(id);

  useBoxedWine(containerProps);

  return (
    <AppContainer {...containerProps} StyledComponent={StyledBoxedWine}>
      <canvas
        aria-label="BoxedWine"
        id="boxedWineCanvas"
        onContextMenu={haltEvent}
        role="img"
      />
    </AppContainer>
  );
};

export default BoxedWine;
