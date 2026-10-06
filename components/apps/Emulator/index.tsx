import StyledEmulator from "components/apps/Emulator/StyledEmulator";
import useEmulator from "components/apps/Emulator/useEmulator";
import AppContainer, {
  useAppContainer,
} from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";

const Emulator: FC<ComponentProcessProps> = ({ id }) => {
  const containerProps = useAppContainer(id);

  useEmulator(containerProps);

  return <AppContainer {...containerProps} StyledComponent={StyledEmulator} />;
};

export default Emulator;
