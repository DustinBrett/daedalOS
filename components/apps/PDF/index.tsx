import Controls from "components/apps/PDF/Controls";
import StyledPDF from "components/apps/PDF/StyledPDF";
import usePDF from "components/apps/PDF/usePDF";
import AppContainer from "components/system/Apps/AppContainer";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";

const PDF: FC<ComponentProcessProps> = ({ id }) => (
  <>
    <AppContainer StyledComponent={StyledPDF} id={id} useHook={usePDF}>
      <ol className="pages" />
    </AppContainer>
    <Controls id={id} />
  </>
);

export default PDF;
