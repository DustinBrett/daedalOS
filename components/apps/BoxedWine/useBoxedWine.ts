import { getConfig } from "components/apps/BoxedWine/config";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { basename, extname } from "path";
import { useCallback, useEffect, useRef } from "react";
import { isCanvasDrawn, loadFiles } from "utils/functions";

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

const getExeName = async (zipData: Buffer): Promise<string | undefined> => {
  const { unzip } = await import("utils/zipFunctions");
  const fileList = Object.entries(await unzip(zipData));
  const [[fileName] = []] = fileList
    .filter(([name]) => name.toLowerCase().endsWith(".exe"))
    .sort(([, aFile], [, bFile]) => bFile.length - aFile.length);

  return fileName;
};

const useBoxedWine = (
  id: string,
  url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  const { appendFileToTitle } = useTitle(id);
  const { processes: { [id]: { libs = [] } = {} } = {} } = useProcesses();
  const { readFile } = useFileSystem();
  const loadedUrl = useRef<string>();
  const blankCanvasCheckerTimer = useRef<number | undefined>();
  const loadEmulator = useCallback(async (): Promise<void> => {
    let dynamicConfig = {};
    let appPayload = url ? await readFile(url) : Buffer.from("");
    const extension = extname(url).toLowerCase();
    const isExecutable = extension === ".exe";
    const { zipAsync } = await import("utils/zipFunctions");
    const appName =
      isExecutable || !url
        ? basename(url, extension)
        : await getExeName(appPayload);

    if (isExecutable) {
      appPayload = Buffer.from(await zipAsync({ [basename(url)]: appPayload }));
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
          blankCanvasCheckerTimer.current = undefined;
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
        window.BoxedWineShell(() => setLoading(false));
      } catch {
        // Ignore BoxedWine errors
      }
    });
  }, [appendFileToTitle, containerRef, libs, readFile, setLoading, url]);

  useEffect(() => {
    if (loadedUrl.current !== url) {
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
