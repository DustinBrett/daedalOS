import extensions from "components/system/Files/FileEntry/extensions";
import { getDefaultFileViewer } from "components/system/Files/FileEntry/functions";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import { extname } from "path";
import { useCallback, useEffect, useState } from "react";
import { getSearchParam } from "utils/functions";

const useUrlLoader = (): void => {
  const { exists } = useFileSystem();
  const { open } = useProcesses();
  const [initialApp, setInitialApp] = useState<string>("");
  const loadInitialApp = useCallback(async () => {
    const url = getSearchParam("url");
    const urlExists =
      (initialApp === "Browser" && url.startsWith("http")) ||
      (await exists(url));

    open(initialApp, urlExists ? { url } : undefined);
  }, [exists, initialApp, open]);

  useEffect(() => {
    const app = getSearchParam("app");
    const url = getSearchParam("url");

    if (app) {
      const lcAppNames = Object.fromEntries(
        Object.keys(processDirectory).map((name) => [name.toLowerCase(), name])
      );

      setInitialApp(lcAppNames[app.toLowerCase()]);
    } else if (url) {
      const extension = extname(url).toLowerCase();
      const { process: [defaultApp] = [] } = extensions[extension] || {};

      setInitialApp(defaultApp || getDefaultFileViewer(extension));
    }
  }, []);

  useEffect(() => {
    if (initialApp) {
      setInitialApp("");
      loadInitialApp();
    }
  }, [initialApp, loadInitialApp]);
};

export default useUrlLoader;
