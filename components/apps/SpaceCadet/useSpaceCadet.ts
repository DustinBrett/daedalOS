import { useProcesses } from "contexts/process";
import { useEffect, useState } from "react";
import { TRANSITIONS_IN_MILLISECONDS } from "utils/constants";
import { loadFiles } from "utils/functions";

declare global {
  interface Window {
    Module: {
      SDL2?: {
        audioContext: AudioContext;
      };
      canvas: HTMLCanvasElement;
      postRun: () => void;
    };
  }
}

const useSpaceCadet = (
  id: string,
  _url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  const { processes: { [id]: { libs = [] } = {} } = {} } = useProcesses();
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();

  useEffect(() => {
    const containerCanvas = containerRef.current?.querySelector("canvas");

    if (containerCanvas instanceof HTMLCanvasElement) {
      window.Module = {
        canvas: containerCanvas,
        postRun: () => setLoading(false),
      };
      setCanvas(containerCanvas);
    }
  }, [containerRef, setLoading]);

  useEffect(() => {
    if (canvas) {
      setTimeout(() => {
        const { height, width } =
          containerRef.current?.getBoundingClientRect() || {};

        if (height && width) {
          canvas.style.height = `${height}px`;
          canvas.style.width = `${width}px`;

          loadFiles(libs, undefined, !!window.Module.canvas);
        }
      }, TRANSITIONS_IN_MILLISECONDS.WINDOW);
    }

    return () => {
      if (canvas && window.Module) {
        window.Module.SDL2?.audioContext.close();
      }
    };
  }, [canvas, containerRef, libs]);
};

export default useSpaceCadet;
