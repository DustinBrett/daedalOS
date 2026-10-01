import { memo } from "react";
import StyledEmulator from "components/apps/Emulator/StyledEmulator";
import useEmulator from "components/apps/Emulator/useEmulator";
import AppContainer from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";

const Emulator: FC<ComponentProcessProps> = ({ id }) => (
  <AppContainer
    id={id}
    StyledComponent={StyledEmulator}
    useHook={useEmulator}
  />
);

export default memo(Emulator);
