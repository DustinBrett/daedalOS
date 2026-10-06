import StyledRuffle from "components/apps/Ruffle/StyledRuffle";
import useRuffle from "components/apps/Ruffle/useRuffle";
import AppContainer, {
  useAppContainer,
} from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";

const Ruffle: FC<ComponentProcessProps> = ({ id }) => {
  const containerProps = useAppContainer(id);

  useRuffle(containerProps);

  return <AppContainer {...containerProps} StyledComponent={StyledRuffle} />;
};

export default Ruffle;
