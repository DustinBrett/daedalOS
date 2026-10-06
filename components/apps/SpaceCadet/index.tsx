import StyledSpaceCadet from "components/apps/SpaceCadet/StyledSpaceCadet";
import useSpaceCadet from "components/apps/SpaceCadet/useSpaceCadet";
import AppContainer, {
  useAppContainer,
} from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";

const SpaceCadet: FC<ComponentProcessProps> = ({ id }) => {
  const containerProps = useAppContainer(id);

  useSpaceCadet(containerProps);

  return (
    <AppContainer {...containerProps} StyledComponent={StyledSpaceCadet} />
  );
};

export default SpaceCadet;
