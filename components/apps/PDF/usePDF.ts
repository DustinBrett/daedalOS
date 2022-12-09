import type { MetadataInfo } from "components/apps/PDF/types";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { basename } from "path";
import type * as PdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import { useCallback, useEffect, useState } from "react";
import { DEFAULT_SCROLLBAR_WIDTH } from "utils/constants";
import { loadFiles } from "utils/functions";

export const scales = [
  0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4,
  5,
];

const getInitialScale = (windowWidth = 0, canvasWidth = 0): number => {
  const adjustedWindowWidth = windowWidth - DEFAULT_SCROLLBAR_WIDTH;

  if (adjustedWindowWidth >= canvasWidth) return 1;

  const minScale = adjustedWindowWidth / canvasWidth;
  const minScaleIndex = scales.findIndex((scale) => scale >= minScale);

  return minScaleIndex > 0 ? scales[minScaleIndex - 1] : 1;
};

const usePDF = (
  id: string,
  url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  const { readFile } = useFileSystem();
  const { argument, processes: { [id]: process } = {} } = useProcesses();
  const { libs = [], scale } = process || {};
  const [pages, setPages] = useState<HTMLCanvasElement[]>([]);
  const renderPage = useCallback(
    async (
      pageNumber: number,
      doc: PDFDocumentProxy
    ): Promise<HTMLCanvasElement> => {
      const canvas = document.createElement("canvas");
      const canvasContext = canvas.getContext("2d") as CanvasRenderingContext2D;
      const page = await doc.getPage(pageNumber);
      let viewport: PdfjsLib.PageViewport;

      if (scale) {
        viewport = page.getViewport({ scale });
      } else {
        const pageWidth = page.getViewport().viewBox[2];
        const initialScale = getInitialScale(
          containerRef.current?.clientWidth,
          pageWidth
        );
        const { info } = await doc.getMetadata();

        argument(id, "scale", initialScale);

        if ((info as MetadataInfo)?.Title) {
          argument(id, "subTitle", (info as MetadataInfo).Title);
        }

        viewport = page.getViewport({ scale: initialScale });
      }

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext, viewport }).promise;

      return canvas;
    },
    [argument, containerRef, id, scale]
  );
  const { prependFileToTitle } = useTitle(id);
  const renderPages = useCallback(async (): Promise<void> => {
    if (window.pdfjsLib && url && containerRef.current) {
      setLoading(true);

      const doc = await window.pdfjsLib.getDocument(await readFile(url))
        .promise;

      argument(id, "count", doc.numPages);
      setPages(
        await Promise.all(
          Array.from({ length: doc.numPages }).map((_, i) =>
            renderPage(i + 1, doc)
          )
        )
      );
      prependFileToTitle(basename(url));
    }

    setLoading(false);
  }, [
    argument,
    containerRef,
    id,
    prependFileToTitle,
    readFile,
    renderPage,
    setLoading,
    url,
  ]);

  useEffect(() => {
    loadFiles(libs).then(() => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "/Program Files/PDF.js/pdf.worker.js";

        renderPages();
      }
    });
  }, [libs, renderPages]);

  useEffect(() => {
    if (pages.length > 0) {
      const ol = containerRef.current?.querySelector(
        "#pages"
      ) as HTMLOListElement;

      if (ol) {
        [...ol.children].forEach((li) => li.remove());

        pages.forEach((page, pageNumber) => {
          const li = document.createElement("li");
          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  argument(id, "page", pageNumber + 1);
                }
              });
            },
            {
              root: containerRef.current,
              threshold: 0.4,
            }
          );

          li.append(page);
          ol.append(li);

          observer.observe(li);
        });
      }
    }
  }, [argument, containerRef, id, pages]);
};

export default usePDF;
