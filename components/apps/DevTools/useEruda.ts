import type { ContainerHookProps } from "components/system/Apps/AppContainer";
import { useProcesses } from "contexts/process";
import type Eruda from "eruda";
import type { InitOptions } from "eruda";
import { useEffect } from "react";
import { loadFiles, viewWidth } from "utils/functions";

declare global {
  interface Window {
    eruda?: typeof Eruda;
  }
}

const config: InitOptions = {
  autoScale: true,
  defaults: {
    displaySize: 100,
    theme: "Monokai Pro",
    transparency: 0,
  },
  useShadowDom: false,
};

const FULL_TOOLBAR_WIDTH = 395;
const RESOURCES_BUTTON_WIDTH = 74;

const useEruda = ({
  containerRef,
  id,
  loading,
  setLoading,
  url,
}: ContainerHookProps): void => {
  const { processes: { [id]: { closing = false, libs = [] } = {} } = {} } =
    useProcesses();

  useEffect(() => {
    loadFiles(libs).then(() => {
      if (window.eruda && containerRef.current) {
        const container = containerRef.current.querySelector(
          "div"
        ) as HTMLElement;
        const vw = viewWidth();

        if (container) {
          window.eruda.init({
            ...config,
            container,
          });
          window.eruda.remove("info");
          window.eruda.remove("snippets");
          if (vw < FULL_TOOLBAR_WIDTH) {
            window.eruda.remove("resources");
          }
          if (vw < FULL_TOOLBAR_WIDTH - RESOURCES_BUTTON_WIDTH) {
            window.eruda.remove("sources");
          }
          window.eruda.show();
          setLoading(false);
        }
      }
    });
  }, [containerRef, libs, setLoading]);

  useEffect(() => {
    if (window.eruda && url && !loading && !closing) {
      window.eruda.show(url);
    }

    return () => {
      if (closing) {
        window.eruda?.destroy();
      }
    };
  }, [closing, loading, url]);
};

export default useEruda;
