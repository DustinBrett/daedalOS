import { useEffect, useRef } from "react";
import { getProcessByFileExtension } from "components/system/Files/FileEntry/functions";
import { useFileSystemActions, useFs } from "contexts/fileSystem";
import { useProcessesActions } from "contexts/process";
import processDirectory from "contexts/process/directory";
import { useSessionLoaded } from "contexts/session";
import { getExtension, getSearchParam, isYouTubeUrl } from "utils/functions";

const isBrowserUrl = (url: string): boolean =>
  url.startsWith("http://") ||
  url.startsWith("https://") ||
  url.startsWith("chrome://");

const useUrlLoader = (): void => {
  const { exists, stat } = useFileSystemActions();
  const fs = useFs();
  const { open } = useProcessesActions();
  const sessionLoaded = useSessionLoaded();
  const loadedInitialAppRef = useRef(false);

  useEffect(() => {
    if (
      loadedInitialAppRef.current ||
      !fs ||
      !exists ||
      !open ||
      !sessionLoaded
    ) {
      return;
    }

    loadedInitialAppRef.current = true;

    const app = getSearchParam("app");
    const url = getSearchParam("url");

    const loadInitialApp = async (initialApp: string): Promise<void> => {
      if (!initialApp) return;

      let urlExists = false;

      try {
        urlExists =
          (initialApp === "Browser" && isBrowserUrl(url)) ||
          (initialApp === "VideoPlayer" && isYouTubeUrl(url)) ||
          (await exists(url));
      } catch {
        // Ignore error checking if url exists
      }

      if (initialApp === "FileExplorer" && url && !urlExists) return;

      open(initialApp, urlExists ? { url } : undefined);
    };

    if (app) {
      const lcAppNames = Object.fromEntries(
        Object.entries(processDirectory)
          .filter(([, { dialogProcess }]) => !dialogProcess)
          .map(([name]) => [name.toLowerCase(), name])
      );

      loadInitialApp(lcAppNames[app.toLowerCase()]);
    } else if (url) {
      if (isYouTubeUrl(url)) {
        loadInitialApp("VideoPlayer");
      } else if (isBrowserUrl(url)) {
        loadInitialApp("Browser");
      } else {
        try {
          stat(url).then((stats) =>
            loadInitialApp(
              stats.isDirectory()
                ? "FileExplorer"
                : getProcessByFileExtension(getExtension(url))
            )
          );
        } catch {
          // Ignore error getting url
        }
      }
    }
  }, [exists, fs, open, sessionLoaded, stat]);
};

export default useUrlLoader;
