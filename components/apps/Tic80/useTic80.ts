import { basename } from "path";
import { useCallback, useEffect, useRef } from "react";
import { type ContainerHookProps } from "components/system/Apps/AppContainer";
import { useProcesses } from "contexts/process";
import { bufferToUrl } from "utils/functions";
import { useFileSystem } from "contexts/fileSystem";
import { useSession } from "contexts/session";
import { PREVENT_SCROLL } from "utils/constants";
import useFileDrop from "components/system/Files/FileManager/useFileDrop";
import useTitle from "components/system/Window/useTitle";
import processDirectory from "contexts/process/directory";

const useTic80 = ({
  containerRef,
  id,
  setLoading,
  url,
}: ContainerHookProps): void => {
  const { processes: { [id]: { libs = [], maximized, title } = {} } = {} } =
    useProcesses();
  const { foregroundId, setForegroundId } = useSession();
  const { readFile } = useFileSystem();
  const { onDragOver, onDrop } = useFileDrop({ id });
  const loadedUrl = useRef<string>(undefined);
  const initializing = useRef(false);
  const { appendFileToTitle } = useTitle(id);
  const createIframe = useCallback((): Window => {
    containerRef.current?.querySelector("iframe")?.remove();

    const iframe = document.createElement("iframe");

    iframe.title = title || processDirectory[id].title;

    containerRef.current?.append(iframe);

    const contentWindow = iframe.contentWindow as Window;

    contentWindow.document.body.style.margin = "0";
    contentWindow.document.body.style.overflow = "hidden";

    return contentWindow;
  }, [containerRef, id, title]);
  const createCanvas = useCallback(
    (baseDocument: Document): HTMLCanvasElement => {
      const canvas = baseDocument.createElement("canvas");

      canvas.id = "canvas";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.imageRendering = "pixelated";
      canvas.tabIndex = -1;

      baseDocument.body.append(canvas);

      return canvas;
    },
    []
  );
  const loadComputer = useCallback(
    (fileUrl?: string) => {
      initializing.current = true;
      setLoading(true);

      const iframeWindow = createIframe();
      const canvas = createCanvas(iframeWindow.document);

      const focusCanvas = (): void => {
        canvas.focus(PREVENT_SCROLL);
        setForegroundId(id);
      };
      const postRun = (): void => setLoading(false);

      iframeWindow.Module = { canvas, postRun };

      iframeWindow.addEventListener("click", focusCanvas);
      iframeWindow.addEventListener("focus", focusCanvas);
      iframeWindow.addEventListener("blur", () => setForegroundId(""));
      iframeWindow.addEventListener("dragover", onDragOver);
      iframeWindow.addEventListener("drop", onDrop);

      const loadApp = (blobUrl?: string): void => {
        if (blobUrl) {
          iframeWindow.Module.arguments = [blobUrl];
          appendFileToTitle(basename(url));
        }

        const [tic80Lib] = libs;
        const script = iframeWindow.document.createElement("script");

        script.type = "text/javascript";
        script.src = tic80Lib;

        iframeWindow.document.head.append(script);

        loadedUrl.current = fileUrl || "";
        initializing.current = false;

        setLoading(false);
      };

      if (fileUrl) {
        readFile(fileUrl).then((file) =>
          loadApp(`${bufferToUrl(file)}?e=.tic`)
        );
      } else {
        loadApp();
      }
    },
    [
      appendFileToTitle,
      createCanvas,
      createIframe,
      id,
      libs,
      onDragOver,
      onDrop,
      readFile,
      setForegroundId,
      setLoading,
      url,
    ]
  );

  useEffect(() => {
    if (!initializing.current && url !== loadedUrl.current) {
      loadComputer(url);
    }
  }, [loadComputer, url]);

  useEffect(() => {
    if (foregroundId === id) {
      requestAnimationFrame(() => {
        containerRef.current
          ?.querySelector("iframe")
          ?.contentWindow?.document.querySelector<HTMLCanvasElement>("#canvas")
          ?.focus(PREVENT_SCROLL);
      });
    }
    // eslint-disable-next-line react-hooks-addons/no-unused-deps
  }, [containerRef, foregroundId, id, maximized]);
};

export default useTic80;
