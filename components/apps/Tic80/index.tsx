import useTic80 from "components/apps/Tic80/useTic80";
import AppContainer, {
  useAppContainer,
} from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";

const Tic80: FC<ComponentProcessProps> = ({ id }) => {
  const containerProps = useAppContainer(id);

  useTic80(containerProps);

  return <AppContainer {...containerProps} />;
};

export default Tic80;
