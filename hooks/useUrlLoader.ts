import type { ExtensionType } from "components/system/Files/FileEntry/extensions";
import extensions from "components/system/Files/FileEntry/extensions";
import { getDefaultFileViewer } from "components/system/Files/FileEntry/functions";
import { useProcesses } from "contexts/process";
import { extname } from "path";
import { useEffect, useState } from "react";
import { getSearchParam } from "utils/functions";

const useUrlLoader = (): void => {
  const { open } = useProcesses();
  const [initialApp, setInitialApp] = useState<string>("");

  useEffect(() => {
    const app = getSearchParam("app");
    const url = getSearchParam("url");

    if (app) setInitialApp(app);
    else if (url) {
      const extension = extname(url);
      const { process: [defaultApp] = [] } =
        extensions[extension as ExtensionType] || {};

      setInitialApp(defaultApp || getDefaultFileViewer(extension));
    }
  }, []);

  useEffect(() => {
    if (initialApp) {
      const url = getSearchParam("url");

      open(initialApp, { url });
    }
  }, [initialApp, open]);
};

export default useUrlLoader;
