import { useEffect } from "react";
import { type default as Eruda, type InitOptions } from "eruda";
import { type ContainerHookProps } from "components/system/Apps/AppContainer";
import { useProcesses } from "contexts/process";
import { loadFiles, viewWidth } from "utils/functions";

declare global {
  interface Window {
    eruda?: typeof Eruda;
    erudaMonitor: Parameters<(typeof Eruda)["add"]>[0];
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

const FULL_TOOLBAR_WIDTH = 455;
const SOURCES_BUTTON_WIDTH = 62;
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
          const tool = ["console", "elements", "network"];

          if (vw >= FULL_TOOLBAR_WIDTH - RESOURCES_BUTTON_WIDTH) {
            tool.push("resources");
          }

          if (vw >= FULL_TOOLBAR_WIDTH) {
            tool.push("sources");
          }

          window.eruda.init({
            ...config,
            container,
            tool,
          });

          if (
            vw >
            FULL_TOOLBAR_WIDTH - RESOURCES_BUTTON_WIDTH - SOURCES_BUTTON_WIDTH
          ) {
            window.eruda.add(window.erudaMonitor);
          }

          window.eruda.show();

          const firstFileEntry = document.querySelector("main > ol > li");

          if (firstFileEntry instanceof HTMLLIElement) {
            window.eruda.get("elements").select(firstFileEntry);
          }

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
