import StyledJSDOS from "components/apps/JSDOS/StyledJSDOS";
import useJSDOS from "components/apps/JSDOS/useJSDOS";
import AppContainer, {
  useAppContainer,
} from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";

const JSDOS: FC<ComponentProcessProps> = ({ id }) => {
  const containerProps = useAppContainer(id);

  useJSDOS(containerProps);

  return <AppContainer {...containerProps} StyledComponent={StyledJSDOS} />;
};

export default JSDOS;
