import StyledQuake3 from "components/apps/Quake3/StyledQuake3";
import useQuake3 from "components/apps/Quake3/useQuake3";
import AppContainer from "components/system/Apps/AppContainer";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";

const Quake3: FC<ComponentProcessProps> = ({ id }) => (
  <AppContainer StyledComponent={StyledQuake3} id={id} useHook={useQuake3} />
);

export default Quake3;
