import { memo } from "react";
import StatusBar from "components/apps/MonacoEditor/StatusBar";
import StyledMonacoEditor from "components/apps/MonacoEditor/StyledMonacoEditor";
import useMonaco from "components/apps/MonacoEditor/useMonaco";
import AppContainer from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";

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

export default memo(MonacoEditor);
