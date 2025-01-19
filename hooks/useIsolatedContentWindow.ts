import {
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
  useMemo,
} from "react";
import useFileDrop from "components/system/Files/FileManager/useFileDrop";
import { PREVENT_SCROLL } from "utils/constants";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";

const createCanvas = (hostDocument: Document): HTMLCanvasElement => {
  const canvas = hostDocument.createElement("canvas");

  canvas.id = "canvas";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.tabIndex = -1;

  hostDocument.body.append(canvas);

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
  contentDocument.write(`
    <!DOCTYPE html>
    ${styles ? `<head><style>${styles}</style></head>` : "<head />"}
    <body />
    `);
  contentDocument.close();

  const contentWindow = iframe.contentWindow as Window;

  contentWindow.document.documentElement.style.height = "100%";
  contentWindow.document.documentElement.style.width = "100%";

  contentWindow.document.body.style.height = "100%";
  contentWindow.document.body.style.width = "100%";
  contentWindow.document.body.style.margin = "0";
  contentWindow.document.body.style.overflow = "hidden";

  return iframe;
};

type IsolatedContentWindow = (() => Window | undefined) | undefined;

const useIsolatedContentWindow = (
  id: string,
  containerRef: React.RefObject<HTMLDivElement | null>,
  focusFunction?: (window: Window) => void,
  styles?: string,
  withCanvas = false
): IsolatedContentWindow => {
  const [container, setContainer] = useState<HTMLDivElement>();
  const [contentWindow, setContentWindow] = useState<Window>();
  const { onDragOver, onDrop } = useFileDrop({ id });
  const { processes: { [id]: { maximized } = {} } = {} } = useProcesses();
  const { foregroundId, setForegroundId } = useSession();
  const createContentWindow = useCallback((): Window | undefined => {
    if (!container) return undefined;

    container.querySelector("iframe")?.remove();

    const iframe = createIframe(id, container, styles);
    const newContentWindow = iframe.contentWindow as Window;

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
  }, [container, id, onDragOver, onDrop, setForegroundId, styles, withCanvas]);

  useLayoutEffect(() => {
    if (contentWindow && foregroundId === id) {
      requestAnimationFrame(() => {
        if (focusFunction) focusFunction(contentWindow);
        else if (withCanvas) {
          contentWindow.document
            .querySelector<HTMLCanvasElement>("canvas")
            ?.focus(PREVENT_SCROLL);
        } else contentWindow.focus();
      });
    }
    // eslint-disable-next-line react-hooks-addons/no-unused-deps
  }, [contentWindow, focusFunction, foregroundId, id, maximized, withCanvas]);

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

  return useMemo(
    () => (container ? createContentWindow : undefined),
    [container, createContentWindow]
  );
};

export default useIsolatedContentWindow;
