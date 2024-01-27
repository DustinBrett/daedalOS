import { memo, useEffect } from "react";
import AppsLoader from "components/system/Apps/AppsLoader";
import Desktop from "components/system/Desktop";
import Taskbar from "components/system/Taskbar";
import useGlobalErrorHandler from "hooks/useGlobalErrorHandler";
import useGlobalKeyboardShortcuts from "hooks/useGlobalKeyboardShortcuts";
import useIFrameFocuser from "hooks/useIFrameFocuser";
import useUrlLoader from "hooks/useUrlLoader";

const useExtensionDisabler = (): void => {
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

const Index = (): React.ReactElement => {
  useIFrameFocuser();
  useUrlLoader();
  useGlobalKeyboardShortcuts();
  useGlobalErrorHandler();
  useExtensionDisabler();

  return (
    <Desktop>
      <Taskbar />
      <AppsLoader />
    </Desktop>
  );
};

export default memo(Index);
