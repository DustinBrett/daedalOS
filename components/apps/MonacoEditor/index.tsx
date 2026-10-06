import StatusBar from "components/apps/MonacoEditor/StatusBar";
import StyledMonacoEditor from "components/apps/MonacoEditor/StyledMonacoEditor";
import useMonaco from "components/apps/MonacoEditor/useMonaco";
import AppContainer, {
  useAppContainer,
} from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";

const MonacoEditor: FC<ComponentProcessProps> = ({ id }) => {
  const containerProps = useAppContainer(id);

  useMonaco(containerProps);

  return (
    <>
      <AppContainer {...containerProps} StyledComponent={StyledMonacoEditor} />
      <StatusBar id={id} />
    </>
  );
};

export default MonacoEditor;
