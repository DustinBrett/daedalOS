import StyledV86 from "components/apps/V86/StyledV86";
import useV86 from "components/apps/V86/useV86";
import AppContainer, {
  useAppContainer,
} from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { haltEvent } from "utils/functions";

const V86: FC<ComponentProcessProps> = ({ id }) => {
  const containerProps = useAppContainer(id);

  useV86(containerProps);

  return (
    <AppContainer {...containerProps} StyledComponent={StyledV86}>
      <div
        aria-label="Text screen"
        onContextMenuCapture={haltEvent}
        role="group"
      />
      <canvas aria-label="Screen" onContextMenuCapture={haltEvent} role="img" />
    </AppContainer>
  );
};

export default V86;
