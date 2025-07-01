import { memo, useRef } from "react";
import Page from "components/apps/PDF/Page";
import Controls from "components/apps/PDF/Controls";
import StyledPDF from "components/apps/PDF/StyledPDF";
import usePDF from "components/apps/PDF/usePDF";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import useFileDrop from "components/system/Files/FileManager/useFileDrop";

const PDF: FC<ComponentProcessProps> = ({ id }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <StyledPDF ref={containerRef} {...useFileDrop({ id })}>
        <ol className="pages">
          {usePDF(id, containerRef).map((canvas, index) => (
            <Page
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              canvas={canvas}
              id={id}
              page={index + 1}
            />
          ))}
        </ol>
      </StyledPDF>
      <Controls id={id} />
    </>
  );
};

export default memo(PDF);
