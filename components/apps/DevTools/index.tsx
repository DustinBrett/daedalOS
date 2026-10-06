import StyledDevTools from "components/apps/DevTools/StyledDevTools";
import useEruda from "components/apps/DevTools/useEruda";
import AppContainer, {
  useAppContainer,
} from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";

const DevTools: FC<ComponentProcessProps> = ({ id }) => {
  const containerProps = useAppContainer(id);

  useEruda(containerProps);

  return (
    <AppContainer {...containerProps} StyledComponent={StyledDevTools}>
      <div />
    </AppContainer>
  );
};

export default DevTools;
