import AppContainer from "components/apps/AppContainer";
import StyledChess from "components/apps/Chess/StyledChess";
import useChess from "components/apps/Chess/useChess";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";

const Chess: FC<ComponentProcessProps> = ({ id }) => (
  <AppContainer StyledComponent={StyledChess} id={id} useHook={useChess}>
    <div id="chessDesk" />
  </AppContainer>
);

export default Chess;
