import StyledDXBall from "components/apps/DX-Ball/StyledDXBall";
import useDXBall from "components/apps/DX-Ball/useDXBall";
import AppContainer, {
  useAppContainer,
} from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { haltEvent } from "utils/functions";

const DXBall: FC<ComponentProcessProps> = ({ id }) => {
  const containerProps = useAppContainer(id);

  useDXBall(containerProps);

  return (
    <AppContainer {...containerProps} StyledComponent={StyledDXBall}>
      <canvas
        aria-label="DX-Ball"
        id="dx-ball"
        onContextMenuCapture={haltEvent}
        role="img"
      />
    </AppContainer>
  );
};

export default DXBall;
