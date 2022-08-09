import { useProcesses } from "contexts/process";
import { useEffect, useState } from "react";
import { loadFiles } from "utils/functions";

declare global {
  interface Window {
    Module: {
      SDL2?: {
        audioContext: AudioContext;
      };
      canvas: HTMLCanvasElement;
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
      window.Module = { canvas: containerCanvas };
      setCanvas(containerCanvas);
    }
  }, [containerRef]);

  useEffect(() => {
    if (canvas) {
      loadFiles(libs, undefined, !!window.Module.canvas).then(() =>
        setLoading(false)
      );
    }

    return () => {
      if (canvas && window.Module) {
        window.Module.SDL2?.audioContext.close();
      }
    };
  }, [canvas, libs, setLoading]);
};

export default useSpaceCadet;
