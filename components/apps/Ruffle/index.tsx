import StyledRuffle from "components/apps/Ruffle/StyledRuffle";
import useRuffle from "components/apps/Ruffle/useRuffle";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useRef } from "react";

const Ruffle = ({ id }: ComponentProcessProps): JSX.Element => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useRuffle(id, containerRef.current);

  return <StyledRuffle ref={containerRef} />;
};

export default Ruffle;
