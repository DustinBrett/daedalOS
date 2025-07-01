import { memo } from "react";
import StyledJSDOS from "components/apps/JSDOS/StyledJSDOS";
import useJSDOS from "components/apps/JSDOS/useJSDOS";
import AppContainer from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";

const JSDOS: FC<ComponentProcessProps> = ({ id }) => (
  <AppContainer StyledComponent={StyledJSDOS} id={id} useHook={useJSDOS} />
);

export default memo(JSDOS);
