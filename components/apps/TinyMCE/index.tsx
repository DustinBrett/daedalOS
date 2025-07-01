import { memo } from "react";
import StyledTinyMceEditor from "components/apps/TinyMCE/StyledTinyMceEditor";
import useTinyMCE from "components/apps/TinyMCE/useTinyMCE";
import AppContainer from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";

const TinyMCE: FC<ComponentProcessProps> = ({ id }) => (
  <AppContainer
    StyledComponent={StyledTinyMceEditor}
    id={id}
    useHook={useTinyMCE}
  >
    <div id={id} />
  </AppContainer>
);

export default memo(TinyMCE);
