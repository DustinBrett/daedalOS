import ContainerComponent from "components/apps/AppContainer";
import Controls from "components/apps/PDF/Controls";
import StyledPDF from "components/apps/PDF/StyledPDF";
import usePDF from "components/apps/PDF/usePDF";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";

const PDF = ({ id }: ComponentProcessProps): JSX.Element =>
  ContainerComponent(
    id,
    usePDF,
    StyledPDF,
    <ol id="pages" />,
    <Controls id={id} />
  );

export default PDF;
