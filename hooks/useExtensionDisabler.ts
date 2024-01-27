import { useEffect } from "react";

export const useExtensionDisabler = (): void => {
  useEffect(() => {
    // https://github.com/darkreader/darkreader/blob/main/CONTRIBUTING.md#disabling-dark-reader-on-your-site
    // TODO: Remove once in https://github.com/darkreader/darkreader/blob/main/src/config/dark-sites.config
    if ("darkreaderMode" in document.documentElement.dataset) {
      const metaDarkReaderOff = document.createElement("meta");

      metaDarkReaderOff.name = "darkreader-lock";

      document.head.append(metaDarkReaderOff);
    }
  }, []);
};
