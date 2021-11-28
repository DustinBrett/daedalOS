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

const libs = [
  "/Program Files/Eruda/eruda.js",
  "/Program Files/Eruda/eruda-dom.js",
];

const useEruda = (
  _id: string,
  _url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
): void => {
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
          window.eruda.show();
          setLoading(false);
        }
      }
    });

    return () => window.eruda?.destroy();
  }, [containerRef, setLoading]);
};

export default useEruda;
