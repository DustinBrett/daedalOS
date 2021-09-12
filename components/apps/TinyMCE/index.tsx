import StyledTinyMceEditor from "components/apps/TinyMCE/StyledTinyMceEditor";
import useTinyMCE from "components/apps/TinyMCE/useTinyMCE";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import ContainerComponent from "utils/ContainerComponent";

const TinyMCE = ({ id }: ComponentProcessProps): JSX.Element =>
  ContainerComponent(id, useTinyMCE, StyledTinyMceEditor, <div />);

export default TinyMCE;
