import StyledClassiCube from "components/apps/ClassiCube/StyledClassiCube";
import useClassiCube from "components/apps/ClassiCube/useClassiCube";
import AppContainer, {
  useAppContainer,
} from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";

const ClassiCube: FC<ComponentProcessProps> = ({ id }) => {
  const containerProps = useAppContainer(id);

  useClassiCube(containerProps);

  return (
    <AppContainer {...containerProps} StyledComponent={StyledClassiCube} />
  );
};

export default ClassiCube;
