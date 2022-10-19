import AppContainer from "components/apps/AppContainer";
import StatusBar from "components/apps/MonacoEditor/StatusBar";
import StyledMonacoEditor from "components/apps/MonacoEditor/StyledMonacoEditor";
import useMonaco from "components/apps/MonacoEditor/useMonaco";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";

const MonacoEditor: FC<ComponentProcessProps> = ({ id }) => (
  <>
    <AppContainer
      StyledComponent={StyledMonacoEditor}
      id={id}
      useHook={useMonaco}
    />
    <StatusBar id={id} />
  </>
);

export default MonacoEditor;
