import AppContainer from "components/apps/AppContainer";
import StyledTerminal from "components/apps/Terminal/StyledTerminal";
import useTerminal from "components/apps/Terminal/useTerminal";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";

const Terminal: FC<ComponentProcessProps> = ({ id }) => (
  <AppContainer
    StyledComponent={StyledTerminal}
    id={id}
    useHook={useTerminal}
  />
);

export default Terminal;
