import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { basename } from "path";
import type * as PdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import { useCallback, useEffect, useState } from "react";
import { loadFiles } from "utils/functions";

const libs = ["/Program Files/PDF.js/pdf.js"];

declare global {
  interface Window {
    pdfjsLib?: typeof PdfjsLib;
  }
}

const usePDF = (
  id: string,
  url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  const { readFile } = useFileSystem();
  const { argument, processes: { [id]: process } = {} } = useProcesses();
  const { scale = 1 } = process || {};
  const [pages, setPages] = useState<HTMLCanvasElement[]>([]);
  const renderPage = useCallback(
    async (
      pageNumber: number,
      doc: PDFDocumentProxy
    ): Promise<HTMLCanvasElement> => {
      const canvas = document.createElement("canvas");
      const canvasContext = canvas.getContext("2d") as CanvasRenderingContext2D;
      const page = await doc.getPage(pageNumber);
      const viewport = page.getViewport({ scale });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext, viewport }).promise;

      return canvas;
    },
    [scale]
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
  }, [renderPages]);

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

          li.appendChild(page);
          ol.appendChild(li);

          observer.observe(li);
        });
      }
    }
  }, [argument, containerRef, id, pages]);
};

export default usePDF;
