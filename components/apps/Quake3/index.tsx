import { memo } from "react";
import useQuake3 from "components/apps/Quake3/useQuake3";
import AppContainer from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";

const Quake3: FC<ComponentProcessProps> = ({ id }) => (
  <AppContainer id={id} useHook={useQuake3} />
);

export default memo(Quake3);
