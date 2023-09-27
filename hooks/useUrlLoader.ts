import { getProcessByFileExtension } from "components/system/Files/FileEntry/functions";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import { useEffect, useRef } from "react";
import { getExtension, getSearchParam } from "utils/functions";

const useUrlLoader = (): void => {
  const { exists, fs } = useFileSystem();
  const { open } = useProcesses();
  const loadedInitialAppRef = useRef(false);

  useEffect(() => {
    if (loadedInitialAppRef.current || !fs || !exists || !open) return;

    loadedInitialAppRef.current = true;

    const app = getSearchParam("app");
    const url = getSearchParam("url");

    const loadInitialApp = async (initialApp: string): Promise<void> => {
      if (!initialApp) return;

      let urlExists = false;

      try {
        urlExists =
          (initialApp === "Browser" && url.startsWith("http")) ||
          (await exists(url));
      } catch {
        // Ignore error checking if url exists
      }

      if (initialApp === "FileExplorer" && url && !urlExists) return;

      open(initialApp, urlExists ? { url } : undefined);
    };

    if (app) {
      const lcAppNames = Object.fromEntries(
        Object.keys(processDirectory).map((name) => [name.toLowerCase(), name])
      );

      loadInitialApp(lcAppNames[app.toLowerCase()]);
    } else if (url) {
      const extension = getExtension(url);

      loadInitialApp(
        extension ? getProcessByFileExtension(extension) : "FileExplorer"
      );
    }
  }, [exists, fs, open]);
};

export default useUrlLoader;
