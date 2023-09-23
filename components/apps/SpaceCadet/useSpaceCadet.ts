import type { ContainerHookProps } from "components/system/Apps/AppContainer";
import useEmscriptenMount from "components/system/Files/FileManager/useEmscriptenMount";
import type { EmscriptenFS } from "contexts/fileSystem/useAsyncFs";
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

const useSpaceCadet = ({
  containerRef,
  id,
  setLoading,
}: ContainerHookProps): void => {
  const { processes: { [id]: { libs = [] } = {} } = {} } = useProcesses();
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();
  const mountEmFs = useEmscriptenMount();

  useEffect(() => {
    const containerCanvas = containerRef.current?.querySelector("canvas");

    if (containerCanvas instanceof HTMLCanvasElement) {
      window.Module = {
        canvas: containerCanvas,
        postRun: () => {
          setLoading(false);
          mountEmFs(window.FS as EmscriptenFS, "SpaceCadet");
        },
      };
      setCanvas(containerCanvas);
    }
  }, [containerRef, mountEmFs, setLoading]);

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
        try {
          window.Module.SDL2?.audioContext.close();
        } catch {
          // Ignore errors during closing
        }
      }
    };
  }, [canvas, containerRef, libs]);
};

export default useSpaceCadet;
