import { memo } from "react";
import useTic80 from "components/apps/Tic80/useTic80";
import AppContainer from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";

const Tic80: FC<ComponentProcessProps> = ({ id }) => (
  <AppContainer id={id} useHook={useTic80} />
);

export default memo(Tic80);
