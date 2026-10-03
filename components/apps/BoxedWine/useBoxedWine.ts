import { basename, extname } from "path";
import { type Unzipped } from "fflate";
import { useCallback, useEffect, useRef } from "react";
import { getConfig } from "components/apps/BoxedWine/config";
import { type ContainerHookProps } from "components/system/Apps/AppContainer";
import useEmscriptenMount from "components/system/Files/FileManager/useEmscriptenMount";
import useTitle from "components/system/Window/useTitle";
import { useFileSystemActions } from "contexts/fileSystem";
import { type EmscriptenFS } from "contexts/fileSystem/useAsyncFs";
import { useProcess, useProcessesActions } from "contexts/process";
import { getExtension, isCanvasDrawn, loadFiles } from "utils/functions";

type WineFS = EmscriptenFS & {
  close: (stream: { path?: string }) => void;
};

const WINE_LOADER = "/root/base/bin/wine";

declare global {
  interface Window {
    BoxedWineConfig: {
      consoleLog?: (log: string) => void;
      isRunning?: boolean;
      urlParams: string;
    };
    BoxedWineShell: (onLoad: () => void) => void;
  }
}

const getExeName = (files: Unzipped): string | undefined => {
  const fileList = Object.entries(files);
  const [[fileName] = []] = fileList
    .filter(([name]) => name.toLowerCase().endsWith(".exe"))
    .sort(([, aFile], [, bFile]) => bFile.length - aFile.length);

  return fileName;
};

const useBoxedWine = ({
  containerRef,
  id,
  setLoading,
  url,
}: ContainerHookProps): void => {
  const { appendFileToTitle } = useTitle(id);
  const { libs = [] } = useProcess(id);
  const { closeWithTransition } = useProcessesActions();
  const { readFile } = useFileSystemActions();
  const mountEmFs = useEmscriptenMount();
  const loadedUrl = useRef<string>(undefined);
  const blankCanvasCheckerTimer = useRef(0);
  const loadEmulator = useCallback(async (): Promise<void> => {
    let dynamicConfig = {};
    const [initialPayload, { zipAsync }] = await Promise.all([
      url ? readFile(url) : Promise.resolve(Buffer.from("")),
      import("utils/zipFunctions"),
    ]);
    let appPayload = initialPayload;
    const extension = getExtension(url);
    const isExecutable = extension === ".exe";
    let appName = basename(url, extension);
    const zippedPayload = async (): Promise<Buffer> =>
      Buffer.from(await zipAsync({ [basename(url)]: appPayload }));

    if (isExecutable) {
      appPayload = await zippedPayload();
    } else if (url) {
      const { unzip } = await import("utils/zipFunctions");

      try {
        appName = getExeName(await unzip(appPayload)) || "";
      } catch {
        appPayload = await zippedPayload();
        appName = "";
      }
    }

    dynamicConfig = {
      ...(appPayload ? { "app-payload": appPayload.toString("base64") } : {}),
      ...(appName ? { p: appName } : {}),
    };

    if (!blankCanvasCheckerTimer.current) {
      const consoleList = document.createElement("ol");

      consoleList.setAttribute("aria-label", "Boot log");
      containerRef.current?.prepend(consoleList);
      blankCanvasCheckerTimer.current = window.setInterval(() => {
        if (isCanvasDrawn(containerRef.current?.querySelector("canvas"))) {
          clearInterval(blankCanvasCheckerTimer.current);
          blankCanvasCheckerTimer.current = 0;
          containerRef.current?.querySelector("ol")?.remove();
        }
      }, 100);
    }

    window.BoxedWineConfig = {
      ...window.BoxedWineConfig,
      consoleLog: (log: string) => {
        const consoleElement = containerRef.current?.querySelector("ol");

        if (consoleElement) {
          const consoleEntry = document.createElement("li");

          consoleEntry.textContent = log;
          consoleElement.append(consoleEntry);
          consoleElement.scrollTop = consoleElement.scrollHeight;
          setTimeout(
            () => consoleElement.scrollTo(0, consoleElement.scrollHeight),
            10
          );
        }
      },
      urlParams: getConfig(dynamicConfig),
    };

    loadFiles(libs).then(() => {
      if (url) appendFileToTitle(appName || basename(url));
      try {
        window.BoxedWineShell(() => {
          const wineFs = window.FS as WineFS;
          const { close } = wineFs;

          // Each Wine process holds the loader open until it exits, once the
          // program has drawn the first one to close means it was closed
          wineFs.close = (stream) => {
            close(stream);

            if (
              appName &&
              stream.path === WINE_LOADER &&
              !blankCanvasCheckerTimer.current
            ) {
              closeWithTransition(id);
            }
          };

          setLoading(false);
          mountEmFs(
            wineFs,
            url ? `BoxedWine_${basename(url, extname(url))}` : id
          );
        });
      } catch {
        // Ignore BoxedWine errors
      }
    });
  }, [
    appendFileToTitle,
    closeWithTransition,
    containerRef,
    id,
    libs,
    mountEmFs,
    readFile,
    setLoading,
    url,
  ]);

  useEffect(() => {
    if (loadedUrl.current !== url && (url || !loadedUrl.current)) {
      loadedUrl.current = url;
      loadEmulator();
    }

    return () => {
      window.BoxedWineConfig = {
        ...window.BoxedWineConfig,
        isRunning: false,
      };
    };
  }, [loadEmulator, url]);
};

export default useBoxedWine;
