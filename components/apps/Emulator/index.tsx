import ContainerComponent from "components/apps/AppContainer";
import StyledEmulator from "components/apps/Emulator/StyledEmulator";
import useEmulator from "components/apps/Emulator/useEmulator";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";

const Emulator: FC<ComponentProcessProps> = ({ id }) =>
  ContainerComponent(id, useEmulator, StyledEmulator, <div id="emulator" />);

export default Emulator;
