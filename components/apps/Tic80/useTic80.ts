import { basename } from "path";
import { useCallback, useEffect, useRef } from "react";
import { type ContainerHookProps } from "components/system/Apps/AppContainer";
import { useProcesses } from "contexts/process";
import { bufferToUrl, haltEvent, loadFiles } from "utils/functions";
import { useFileSystem } from "contexts/fileSystem";
import useTitle from "components/system/Window/useTitle";
import useIsolatedContentWindow from "hooks/useIsolatedContentWindow";

const useTic80 = ({
  containerRef,
  id,
  setLoading,
  url,
}: ContainerHookProps): void => {
  const { processes: { [id]: { closing, libs = [] } = {} } = {} } =
    useProcesses();
  const { readFile } = useFileSystem();
  const loadedUrl = useRef<string>(undefined);
  const { appendFileToTitle } = useTitle(id);
  const getContentWindow = useIsolatedContentWindow(
    id,
    containerRef,
    undefined,
    "canvas { image-rendering: pixelated; }",
    true
  );
  const loadComputer = useCallback(
    async (fileUrl?: string) => {
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

      loadApp(fileUrl ? `${bufferToUrl(await readFile(fileUrl))}?e=.tic` : "");
    },
    [appendFileToTitle, getContentWindow, libs, readFile, setLoading, url]
  );

  useEffect(() => {
    if (url !== loadedUrl.current && !closing) loadComputer(url);
  }, [closing, loadComputer, url]);
};

export default useTic80;
