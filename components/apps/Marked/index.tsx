import ContainerComponent from "components/apps/AppContainer";
import StyledMarked from "components/apps/Marked/StyledMarked";
import useMarked from "components/apps/Marked/useMarked";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";

const Marked = ({ id }: ComponentProcessProps): JSX.Element =>
  // eslint-disable-next-line jsx-a11y/iframe-has-title
  ContainerComponent(id, useMarked, StyledMarked, <iframe />);

export default Marked;
