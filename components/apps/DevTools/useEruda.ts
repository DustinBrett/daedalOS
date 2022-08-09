import { useProcesses } from "contexts/process";
import type Eruda from "eruda";
import type { InitOptions, Tool } from "eruda";
import { useEffect } from "react";
import { loadFiles } from "utils/functions";

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

const useEruda = (
  id: string,
  url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  loading: boolean
): void => {
  const { processes: { [id]: { libs = [] } = {} } = {} } = useProcesses();

  useEffect(() => {
    loadFiles(libs).then(() => {
      if (window.eruda && window.erudaDom && containerRef.current) {
        const container = containerRef.current.querySelector(
          "div"
        ) as HTMLElement;

        if (container) {
          window.eruda.init({
            ...config,
            container,
          });
          window.eruda.add(window.erudaDom);
          window.eruda.remove("info");
          window.eruda.remove("snippets");
          window.eruda.show();
          setLoading(false);
        }
      }
    });

    return () => window.eruda?.destroy();
  }, [containerRef, libs, setLoading]);

  useEffect(() => {
    if (window.eruda && url && !loading) {
      window.eruda.show(url);
    }
  }, [loading, url]);
};

export default useEruda;
