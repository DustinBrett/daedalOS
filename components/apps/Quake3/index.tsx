import useQuake3 from "components/apps/Quake3/useQuake3";
import AppContainer, {
  useAppContainer,
} from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";

const Quake3: FC<ComponentProcessProps> = ({ id }) => {
  const containerProps = useAppContainer(id);

  useQuake3(containerProps);

  return <AppContainer {...containerProps} />;
};

export default Quake3;
