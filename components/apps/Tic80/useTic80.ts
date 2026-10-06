import { basename } from "path";
import { useEffect, useRef } from "react";
import { type ContainerHookProps } from "components/system/Apps/AppContainer";
import useTitle from "components/system/Window/useTitle";
import { useFileSystemActions } from "contexts/fileSystem";
import { useProcess } from "contexts/process";
import useIsolatedContentWindow from "hooks/useIsolatedContentWindow";
import { bufferToUrl, haltEvent, loadFiles } from "utils/functions";

const useTic80 = ({
  containerRef,
  id,
  setLoading,
  url,
}: ContainerHookProps): void => {
  const { closing, libs = [] } = useProcess(id);
  const { readFile } = useFileSystemActions();
  const loadedUrl = useRef<string>(undefined);
  const { appendFileToTitle } = useTitle(id);
  const getContentWindow = useIsolatedContentWindow(
    id,
    containerRef,
    undefined,
    "canvas { image-rendering: pixelated; }",
    true
  );
  const loadApp = async (blobUrl?: string): Promise<void> => {
    const contentWindow = getContentWindow?.();

    if (!contentWindow) return;

    loadedUrl.current = url;
    setLoading(true);

    const canvas = contentWindow.document.querySelector(
      "#canvas"
    ) as HTMLCanvasElement;

    canvas.addEventListener("contextmenu", haltEvent);

    contentWindow.Module = {
      arguments: blobUrl ? [blobUrl] : undefined,
      canvas,
      postRun: () => setLoading(false),
    };

    await loadFiles(libs, undefined, undefined, undefined, contentWindow);

    if (blobUrl) appendFileToTitle(basename(url));
  };
  const loadComputer = async (fileUrl?: string): Promise<void> => {
    loadApp(fileUrl ? `${bufferToUrl(await readFile(fileUrl))}?e=.tic` : "");
  };

  useEffect(() => {
    if (url !== loadedUrl.current && !closing) loadComputer(url);
  }, [closing, loadComputer, url]);
};

export default useTic80;
