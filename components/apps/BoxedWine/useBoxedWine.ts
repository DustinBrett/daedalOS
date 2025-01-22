import { basename, extname } from "path";
import { useCallback, useEffect, useRef } from "react";
import { type Unzipped } from "fflate";
import { getConfig } from "components/apps/BoxedWine/config";
import { type ContainerHookProps } from "components/system/Apps/AppContainer";
import useEmscriptenMount from "components/system/Files/FileManager/useEmscriptenMount";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { type EmscriptenFS } from "contexts/fileSystem/useAsyncFs";
import { useProcesses } from "contexts/process";
import { getExtension, isCanvasDrawn, loadFiles } from "utils/functions";

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
  const { processes: { [id]: { libs = [] } = {} } = {} } = useProcesses();
  const { readFile } = useFileSystem();
  const mountEmFs = useEmscriptenMount();
  const loadedUrl = useRef<string>(undefined);
  const blankCanvasCheckerTimer = useRef(0);
  const loadEmulator = useCallback(async (): Promise<void> => {
    let dynamicConfig = {};
    let appPayload = url ? await readFile(url) : Buffer.from("");
    const extension = getExtension(url);
    const isExecutable = extension === ".exe";
    const { zipAsync } = await import("utils/zipFunctions");
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
      containerRef.current?.prepend(document.createElement("ol"));
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
          setLoading(false);
          mountEmFs(
            window.FS as EmscriptenFS,
            url ? `BoxedWine_${basename(url, extname(url))}` : id
          );
        });
      } catch {
        // Ignore BoxedWine errors
      }
    });
  }, [
    appendFileToTitle,
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
