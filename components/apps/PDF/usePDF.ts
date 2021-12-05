import { useFileSystem } from "contexts/fileSystem";
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
  _id: string,
  url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  const { readFile } = useFileSystem();
  const [scale] = useState(1);
  const [pages, setPages] = useState<HTMLCanvasElement[]>([]);
  const renderPage = useCallback(
    async (
      pageNumber: number,
      doc: PDFDocumentProxy
    ): Promise<HTMLCanvasElement> => {
      const canvas = document.createElement("canvas") as HTMLCanvasElement;
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
  const renderPages = useCallback(async (): Promise<void> => {
    if (window.pdfjsLib && url && containerRef.current) {
      setLoading(true);

      const doc = await window.pdfjsLib.getDocument(await readFile(url))
        .promise;

      setPages(
        await Promise.all(
          Array.from({ length: doc.numPages }).map((_, i) =>
            renderPage(i + 1, doc)
          )
        )
      );
    }

    setLoading(false);
  }, [containerRef, readFile, renderPage, setLoading, url]);

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
      const ol = containerRef.current?.querySelector("ol") as HTMLOListElement;

      if (ol) {
        [...ol.children].forEach((li) => li.remove());

        pages.forEach((page) => {
          const li = document.createElement("li") as HTMLLIElement;

          li.appendChild(page);
          ol.appendChild(li);
        });
      }
    }
  }, [containerRef, pages]);
};

export default usePDF;
