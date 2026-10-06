import StyledTerminal from "components/apps/Terminal/StyledTerminal";
import useTerminal from "components/apps/Terminal/useTerminal";
import AppContainer, {
  useAppContainer,
} from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";

const Terminal: FC<ComponentProcessProps> = ({ id }) => {
  const containerProps = useAppContainer(id);

  useTerminal(containerProps);

  return <AppContainer {...containerProps} StyledComponent={StyledTerminal} />;
};

export default Terminal;
