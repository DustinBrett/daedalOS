import { basename } from "path";
import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type PDFWorker,
  type PDFDocumentProxy,
} from "pdfjs-dist/types/src/display/api";
import type * as PdfjsLib from "pdfjs-dist";
import { type MetadataInfo } from "components/apps/PDF/types";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { BASE_2D_CONTEXT_OPTIONS } from "utils/constants";
import { loadFiles } from "utils/functions";

export const scales = [
  0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4,
  5,
];

const CANVAS_MARGIN_PX = 4;

const getInitialScale = (windowWidth = 0, canvasWidth = 0): number => {
  const adjustedWindowWidth = windowWidth - CANVAS_MARGIN_PX * 2;

  if (adjustedWindowWidth >= canvasWidth) return 1;

  const minScale = adjustedWindowWidth / canvasWidth;
  const minScaleIndex = scales.findIndex((scale) => scale >= minScale);

  return minScaleIndex > 0 ? scales[minScaleIndex - 1] : 1;
};

const usePDF = (
  id: string,
  containerRef: RefObject<HTMLDivElement | null>
): HTMLCanvasElement[] => {
  const { readFile } = useFileSystem();
  const {
    argument,
    processes: { [id]: process } = {},
    url: setUrl,
  } = useProcesses();
  const { libs = [], scale, url: processUrl } = process || {};
  const [pages, setPages] = useState<HTMLCanvasElement[]>([]);
  const pdfWorker = useRef<PDFWorker | null>(null);
  const renderPage = useCallback(
    async (
      pageNumber: number,
      doc: PDFDocumentProxy
    ): Promise<HTMLCanvasElement> => {
      const canvas = document.createElement("canvas");
      const canvasContext = canvas.getContext(
        "2d",
        BASE_2D_CONTEXT_OPTIONS
      ) as CanvasRenderingContext2D;
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

        argument(id, "scale", initialScale);

        viewport = page.getViewport({ scale: initialScale });
      }

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvas, canvasContext, viewport }).promise;

      return canvas;
    },
    [argument, containerRef, id, scale]
  );
  const { prependFileToTitle } = useTitle(id);
  const currentUrlRef = useRef("");
  const renderingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const resetApp = useCallback(() => {
    abortControllerRef.current?.abort();
    pdfWorker.current?.destroy();

    argument(id, "rendering", false);
    renderingRef.current = false;

    if (containerRef.current) {
      // eslint-disable-next-line no-param-reassign
      containerRef.current.scrollTop = 0;
    }
  }, [argument, containerRef, id]);
  const renderPages = useCallback(
    async (url: string): Promise<void> => {
      if (containerRef.current) {
        setPages([]);

        if (url) {
          containerRef.current.classList.remove("drop");

          if (window.pdfjsLib && !renderingRef.current) {
            renderingRef.current = true;
            argument(id, "rendering", true);

            // eslint-disable-next-line no-param-reassign
            containerRef.current.scrollTop = 0;

            const fileData = await readFile(url);

            if (fileData.length === 0) throw new Error("File is empty");

            const loader = window.pdfjsLib.getDocument(fileData);
            const doc = await loader.promise;
            const { info } = await doc.getMetadata();

            pdfWorker.current = (
              loader as unknown as { _worker: PDFWorker }
            )._worker;

            const { Title } = info as MetadataInfo;

            argument(id, "subTitle", Title);
            argument(id, "count", doc.numPages);
            prependFileToTitle(Title || basename(url));

            abortControllerRef.current = new AbortController();

            for (let i = 0; i < doc.numPages; i += 1) {
              if (
                abortControllerRef.current.signal.aborted ||
                url !== currentUrlRef.current
              ) {
                break;
              }

              // eslint-disable-next-line no-await-in-loop
              const page = await renderPage(i + 1, doc);

              if (
                abortControllerRef.current.signal.aborted ||
                url !== currentUrlRef.current
              ) {
                break;
              }

              setPages((currentPages) => [...currentPages, page]);
            }

            argument(id, "rendering", false);
            renderingRef.current = false;
          }
        } else {
          containerRef.current.classList.add("drop");
          argument(id, "subTitle", "");
          argument(id, "count", 0);
          prependFileToTitle("");
        }
      }
    },
    [argument, containerRef, id, prependFileToTitle, readFile, renderPage]
  );

  useEffect(() => {
    loadFiles(libs).then(() => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "/Program Files/PDF.js/pdf.worker.js";

        if (processUrl) {
          renderPages(processUrl).catch(() => {
            setUrl(id, "");
            argument(id, "rendering", false);
            renderingRef.current = false;
          });
        }
      }
    });
  }, [argument, id, libs, processUrl, renderPages, setUrl]);

  useEffect(() => resetApp, [resetApp]);

  useEffect(() => {
    if (processUrl && currentUrlRef.current !== processUrl) {
      currentUrlRef.current = processUrl;
      resetApp();
    }
  }, [resetApp, processUrl]);

  return pages;
};

export default usePDF;
