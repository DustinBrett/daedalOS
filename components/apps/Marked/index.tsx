import ContainerComponent from "components/apps/AppContainer";
import StyledMarked from "components/apps/Marked/StyledMarked";
import useMarked from "components/apps/Marked/useMarked";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";

const Marked: FC<ComponentProcessProps> = ({ id }) =>
  ContainerComponent(id, useMarked, StyledMarked, <article />);

export default Marked;
