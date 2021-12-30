import ContainerComponent from "components/apps/AppContainer";
import StyledTinyMceEditor from "components/apps/TinyMCE/StyledTinyMceEditor";
import useTinyMCE from "components/apps/TinyMCE/useTinyMCE";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";

const TinyMCE = ({ id }: ComponentProcessProps): JSX.Element =>
  ContainerComponent(id, useTinyMCE, StyledTinyMceEditor, <div />);

export default TinyMCE;
