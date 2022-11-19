import { useProcesses } from "contexts/process";
import { useCallback, useEffect } from "react";
import { TRANSITIONS_IN_MILLISECONDS } from "utils/constants";
import { loadFiles } from "utils/functions";

declare global {
  interface Window {
    CCModule: {
      arguments: string[];
      canvas: HTMLCanvasElement;
      postRun: (() => void)[];
      print: () => void;
      setStatus: () => void;
    };
  }
}

const useClassiCube = (
  id: string,
  _url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  const { processes: { [id]: process } = {} } = useProcesses();
  const { libs } = process || {};
  const getCanvas = useCallback(
    () =>
      (containerRef.current as HTMLElement)?.querySelector(
        "canvas"
      ) as HTMLCanvasElement,
    [containerRef]
  );

  useEffect(() => {
    if (window.CCModule) return;

    setTimeout(() => {
      const canvas = getCanvas();

      window.CCModule = {
        arguments: ["Singleplayer"],
        canvas,
        postRun: [
          () => setLoading(false),
          () => {
            const { width, height } = canvas.getBoundingClientRect() || {};

            canvas.width = width;
            canvas.height = height;
          },
        ],
        print: console.info,
        setStatus: console.info,
      };

      loadFiles(libs);
    }, TRANSITIONS_IN_MILLISECONDS.WINDOW);
  }, [getCanvas, libs, setLoading]);
};

export default useClassiCube;
