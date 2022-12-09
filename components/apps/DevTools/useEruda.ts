import { useProcesses } from "contexts/process";
import type Eruda from "eruda";
import type { InitOptions, Tool } from "eruda";
import { useEffect } from "react";
import { loadFiles, viewWidth } from "utils/functions";

declare global {
  interface Window {
    eruda?: typeof Eruda;
    erudaDom?: Tool;
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

const FULL_TOOLBAR_WIDTH = 438;
const ELEMENTS_BUTTON_WIDTH = 68;

const useEruda = (
  id: string,
  url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  loading: boolean
): void => {
  const { processes: { [id]: { closing = false, libs = [] } = {} } = {} } =
    useProcesses();

  useEffect(() => {
    loadFiles(libs).then(() => {
      if (window.eruda && window.erudaDom && containerRef.current) {
        const container = containerRef.current.querySelector(
          "div"
        ) as HTMLElement;
        const vw = viewWidth();

        if (container) {
          window.eruda.init({
            ...config,
            container,
          });
          window.eruda.add(window.erudaDom);
          window.eruda.remove("info");
          window.eruda.remove("snippets");
          if (vw < FULL_TOOLBAR_WIDTH) {
            window.eruda.remove("elements");
          }
          if (vw < FULL_TOOLBAR_WIDTH - ELEMENTS_BUTTON_WIDTH) {
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
