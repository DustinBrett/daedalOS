import AppContainer from "components/apps/AppContainer";
import StyledEmulator from "components/apps/Emulator/StyledEmulator";
import useEmulator from "components/apps/Emulator/useEmulator";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";

const Emulator: FC<ComponentProcessProps> = ({ id }) => (
  <AppContainer StyledComponent={StyledEmulator} id={id} useHook={useEmulator}>
    <div id="emulator" />
  </AppContainer>
);

export default Emulator;
