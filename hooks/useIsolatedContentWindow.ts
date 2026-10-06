import { useEffect, useLayoutEffect, useState } from "react";
import useFileDrop from "components/system/Files/FileManager/useFileDrop";
import { useMenuIsOpen } from "contexts/menu";
import { useProcess } from "contexts/process";
import { useForegroundId, useSessionActions } from "contexts/session";
import { PREVENT_SCROLL } from "utils/constants";
import { keepCanvasesReadable } from "utils/readableCanvas";

type ContentWindow = Window & typeof globalThis;

const createCanvas = (contentDocument: Document): HTMLCanvasElement => {
  const canvas = contentDocument.createElement("canvas");

  canvas.id = "canvas";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.tabIndex = -1;
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", "Screen");

  contentDocument.body.append(canvas);

  return canvas;
};

const createIframe = (
  id: string,
  container: HTMLDivElement,
  styles?: string
): HTMLIFrameElement => {
  const iframe = document.createElement("iframe");

  iframe.title = id;

  iframe.style.backgroundColor = "transparent";
  iframe.style.border = "0";
  iframe.style.width = "100%";
  iframe.style.height = "100%";

  container.append(iframe);

  const contentDocument = iframe.contentDocument as Document;

  contentDocument.open();
  // eslint-disable-next-line typescript/no-deprecated
  contentDocument.write(`
    <!DOCTYPE html>
    ${styles ? `<head><style>${styles}</style></head>` : "<head />"}
    <body />
    `);
  contentDocument.close();

  const contentWindow = iframe.contentWindow as ContentWindow;

  contentWindow.document.documentElement.style.height = "100%";
  contentWindow.document.documentElement.style.width = "100%";

  contentWindow.document.body.style.height = "100%";
  contentWindow.document.body.style.width = "100%";
  contentWindow.document.body.style.margin = "0";
  contentWindow.document.body.style.overflow = "hidden";

  return iframe;
};

type IsolatedContentWindow = (() => ContentWindow | undefined) | undefined;

const useIsolatedContentWindow = (
  id: string,
  containerRef: React.RefObject<HTMLDivElement | null>,
  focusFunction?: (window: ContentWindow) => void,
  styles?: string,
  withCanvas = false
): IsolatedContentWindow => {
  const [container, setContainer] = useState<HTMLDivElement>();
  const [contentWindow, setContentWindow] = useState<ContentWindow>();
  const { onDragOver, onDrop } = useFileDrop({ id });
  const { maximized } = useProcess(id);
  const { setForegroundId } = useSessionActions();
  const foregroundId = useForegroundId();
  const isContextMenuOpen = useMenuIsOpen();
  const createContentWindow = (): ContentWindow | undefined => {
    if (!container) return undefined;

    container.querySelector("iframe")?.remove();

    const iframe = createIframe(id, container, styles);
    const newContentWindow = iframe.contentWindow as ContentWindow;

    keepCanvasesReadable(newContentWindow);

    let canvas: HTMLCanvasElement;

    if (withCanvas) canvas = createCanvas(iframe.contentDocument as Document);

    const focusContentWindow = (): void => {
      if (withCanvas && canvas) canvas.focus(PREVENT_SCROLL);
      else newContentWindow.focus();

      setForegroundId(id);
    };

    newContentWindow.addEventListener("click", focusContentWindow);
    newContentWindow.addEventListener("focus", focusContentWindow);
    newContentWindow.addEventListener("blur", () => setForegroundId(""));
    newContentWindow.addEventListener("dragover", onDragOver);
    newContentWindow.addEventListener("drop", onDrop);

    setContentWindow(newContentWindow);

    return newContentWindow;
  };

  useLayoutEffect(() => {
    if (contentWindow && foregroundId === id && !isContextMenuOpen) {
      requestAnimationFrame(() => {
        if (focusFunction) focusFunction(contentWindow);
        else if (withCanvas) {
          contentWindow.document
            .querySelector<HTMLCanvasElement>("canvas")
            ?.focus(PREVENT_SCROLL);
        } else contentWindow.focus();
      });
    }
  }, [
    contentWindow,
    focusFunction,
    foregroundId,
    id,
    isContextMenuOpen,
    // eslint-disable-next-line react/exhaustive-effect-dependencies
    maximized,
    withCanvas,
  ]);

  useEffect(() => {
    if (!container) {
      const getContainer = (): void => {
        requestAnimationFrame(() => {
          if (containerRef.current) {
            setContainer(containerRef.current);
          } else {
            getContainer();
          }
        });
      };

      getContainer();
    }
  }, [container, containerRef]);

  return container ? createContentWindow : undefined;
};

export default useIsolatedContentWindow;
