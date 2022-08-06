import ContainerComponent from "components/apps/AppContainer";
import StyledChess from "components/apps/Chess/StyledChess";
import useChess from "components/apps/Chess/useChess";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";

const Chess: FC<ComponentProcessProps> = ({ id }) =>
  ContainerComponent(id, useChess, StyledChess, <div id="chessDesk" />);

export default Chess;
