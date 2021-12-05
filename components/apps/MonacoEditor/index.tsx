import StatusBar from "components/apps/MonacoEditor/StatusBar";
import StyledMonacoEditor from "components/apps/MonacoEditor/StyledMonacoEditor";
import useMonaco from "components/apps/MonacoEditor/useMonaco";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import ContainerComponent from "utils/ContainerComponent";

const MonacoEditor = ({ id }: ComponentProcessProps): JSX.Element =>
  ContainerComponent(
    id,
    useMonaco,
    StyledMonacoEditor,
    undefined,
    <StatusBar id={id} />
  );

export default MonacoEditor;
