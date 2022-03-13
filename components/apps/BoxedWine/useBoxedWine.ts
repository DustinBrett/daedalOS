import { getConfig, libs } from "components/apps/BoxedWine/config";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { basename, extname } from "path";
import { useCallback, useEffect, useRef } from "react";
import { loadFiles } from "utils/functions";

declare global {
  interface Window {
    BoxedWineConfig: {
      isRunning?: boolean;
      urlParams: string;
    };
    BoxedWineShell: (onLoad: () => void) => void;
  }
}

const getExeName = async (zipData: Buffer): Promise<string | undefined> => {
  const { unzipAsync } = await import("utils/zipFunctions");
  const fileList = Object.entries(await unzipAsync(zipData));
  const [[fileName] = []] = fileList
    .filter(([name]) => name.toLowerCase().endsWith(".exe"))
    .sort(([, aFile], [, bFile]) => bFile.length - aFile.length);

  return fileName;
};

const useBoxedWine = (
  id: string,
  url: string,
  _containerRef: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  const { appendFileToTitle } = useTitle(id);
  const { readFile } = useFileSystem();
  const loadedUrl = useRef<string>();
  const loadEmulator = useCallback(async (): Promise<void> => {
    let dynamicConfig = {};
    let appName: string | undefined;

    if (url) {
      let appPayload = await readFile(url);
      const extension = extname(url).toLowerCase();
      const isExecutable = extension === ".exe";
      const { zipAsync } = await import("utils/zipFunctions");
      appName = isExecutable
        ? basename(url, extension)
        : await getExeName(appPayload);

      if (isExecutable) {
        appPayload = Buffer.from(
          await zipAsync({ [basename(url)]: appPayload })
        );
      }

      dynamicConfig = {
        ...(appPayload ? { "app-payload": appPayload.toString("base64") } : {}),
        ...(appName ? { p: appName } : {}),
      };
    }

    window.BoxedWineConfig = {
      ...window.BoxedWineConfig,
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
  }, [appendFileToTitle, readFile, setLoading, url]);

  useEffect(() => {
    if (
      (!loadedUrl.current && typeof url === "string") ||
      (loadedUrl.current && url)
    ) {
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
