import StyledPDF from "components/apps/PDF/StyledPDF";
import usePDF from "components/apps/PDF/usePDF";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import ContainerComponent from "utils/ContainerComponent";

const PDF = ({ id }: ComponentProcessProps): JSX.Element =>
  ContainerComponent(id, usePDF, StyledPDF, <ol />);

export default PDF;
