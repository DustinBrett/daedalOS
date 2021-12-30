import type { ExtensionType } from "components/system/Files/FileEntry/extensions";
import extensions from "components/system/Files/FileEntry/extensions";
import { getDefaultFileViewer } from "components/system/Files/FileEntry/functions";
import { useProcesses } from "contexts/process";
import { extname } from "path";
import { useEffect } from "react";

const useUrlLoader = (): void => {
  const { open } = useProcesses();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const app = searchParams.get("app") || "";
    const url = searchParams.get("url") || "";

    if (app) open(app, { url });
    else if (url) {
      const extension = extname(url);
      let { process: [defaultApp] = [] } =
        extensions[extension as ExtensionType] || {};

      if (!defaultApp) defaultApp = getDefaultFileViewer(extension);
      if (defaultApp) open(defaultApp, { url });
    }
  }, [open]);
};

export default useUrlLoader;
