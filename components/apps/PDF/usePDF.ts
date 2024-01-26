import { basename } from "path";
import { useCallback, useEffect, useRef, useState } from "react";
import { type PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import type * as PdfjsLib from "pdfjs-dist";
import { type MetadataInfo } from "components/apps/PDF/types";
import { type ContainerHookProps } from "components/system/Apps/AppContainer";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import {
  BASE_2D_CONTEXT_OPTIONS,
  DEFAULT_INTERSECTION_OPTIONS,
} from "utils/constants";
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

const usePDF = ({
  containerRef,
  id,
  setLoading,
  url,
}: ContainerHookProps): void => {
  const { readFile } = useFileSystem();
  const {
    argument,
    processes: { [id]: process } = {},
    url: setUrl,
  } = useProcesses();
  const { libs = [], scale } = process || {};
  const [pages, setPages] = useState<HTMLCanvasElement[]>([]);
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

      await page.render({ canvasContext, viewport }).promise;

      return canvas;
    },
    [argument, containerRef, id, scale]
  );
  const { prependFileToTitle } = useTitle(id);
  const renderingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const renderPages = useCallback(async (): Promise<void> => {
    if (
      window.pdfjsLib &&
      url &&
      containerRef.current &&
      !renderingRef.current
    ) {
      renderingRef.current = true;
      argument(id, "rendering", true);

      // eslint-disable-next-line no-param-reassign
      containerRef.current.scrollTop = 0;
      setPages([]);
      setLoading(true);

      const fileData = await readFile(url);

      if (fileData.length === 0) throw new Error("File is empty");

      const doc = await window.pdfjsLib.getDocument(fileData).promise;
      const { info } = await doc.getMetadata();

      argument(id, "subTitle", (info as MetadataInfo).Title);
      argument(id, "count", doc.numPages);
      prependFileToTitle(basename(url));

      abortControllerRef.current = new AbortController();

      for (let i = 0; i < doc.numPages; i += 1) {
        if (abortControllerRef.current.signal.aborted) break;
        if (i === 1) setLoading(false);

        // eslint-disable-next-line no-await-in-loop
        const page = await renderPage(i + 1, doc);

        setPages((currentPages) => [...currentPages, page]);
      }

      argument(id, "rendering", false);
      renderingRef.current = false;
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

        renderPages().catch(() => {
          setUrl(id, "");
          setLoading(false);
        });
      }
    });
  }, [id, libs, renderPages, setLoading, setUrl]);

  useEffect(() => {
    if (pages.length > 0) {
      const ol = containerRef.current?.querySelector(
        "ol.pages"
      ) as HTMLOListElement;

      if (ol) {
        [...ol.children].forEach((li) => li.remove());

        pages.forEach((page, pageNumber) => {
          const li = document.createElement("li");
          const observer = new IntersectionObserver(
            (entries) =>
              entries.forEach(({ isIntersecting }) => {
                if (isIntersecting) argument(id, "page", pageNumber + 1);
              }),
            {
              root: containerRef.current,
              ...DEFAULT_INTERSECTION_OPTIONS,
            }
          );

          li.append(page);
          ol.append(li);

          observer.observe(li);
        });
      }
    }
  }, [argument, containerRef, id, pages]);

  useEffect(() => () => abortControllerRef.current?.abort(), []);
};

export default usePDF;
