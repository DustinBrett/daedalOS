import type { ContainerHookProps } from "components/system/Apps/AppContainer";
import useEmscriptenMount from "components/system/Files/FileManager/useEmscriptenMount";
import type { EmscriptenFS } from "contexts/fileSystem/useAsyncFs";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { useEffect, useRef } from "react";
import { useTheme } from "styled-components";
import { TRANSITIONS_IN_MILLISECONDS } from "utils/constants";
import { loadFiles, pxToNum } from "utils/functions";

declare global {
  interface Window {
    AL?: {
      contexts: {
        ctx: AudioContext;
      }[];
    };
    ioq3?: {
      callMain: (args: string[]) => void;
      canvas: HTMLCanvasElement | null;
      elementPointerLock: boolean;
      exit: () => void;
      exitHandler: (error: Error | null) => void;
      setCanvasSize: (width: number, height: number) => void;
      viewport: HTMLDivElement | null;
    };
  }
}

const useQuake3 = ({
  containerRef,
  id,
  setLoading,
}: ContainerHookProps): void => {
  const {
    processes: {
      [id]: { componentWindow, defaultSize, libs = [], maximized = false },
    } = {},
  } = useProcesses();
  const {
    windowStates: { [id]: windowState },
  } = useSession();
  const {
    sizes: { titleBar },
  } = useTheme();
  const wasMaximized = useRef(false);
  const mountEmFs = useEmscriptenMount();
  const { size } = windowState || {};

  useEffect(() => {
    loadFiles(libs).then(() => {
      if (!window.ioq3) return;

      window.ioq3.viewport = containerRef.current;
      window.ioq3.elementPointerLock = true;
      window.ioq3.callMain([]);

      setLoading(false);
      mountEmFs(window.FS as EmscriptenFS, "Quake3");
    });
  }, [containerRef, libs, mountEmFs, setLoading]);

  useEffect(() => {
    if (!window.ioq3) return;

    setTimeout(
      () => {
        wasMaximized.current = maximized;

        const { height, width } =
          (!maximized && size) ||
          componentWindow?.getBoundingClientRect() ||
          {};

        if (!height || !width) return;

        const aspectRatio = defaultSize
          ? pxToNum(defaultSize.width) / pxToNum(defaultSize.height)
          : 4 / 3;
        const numWidth = pxToNum(width);
        const hasGreaterWidth = numWidth > pxToNum(height) - titleBar.height;
        const newWidth =
          maximized && hasGreaterWidth ? numWidth / aspectRatio : numWidth;
        const newHeight = newWidth / aspectRatio;

        if (newHeight > 0 && newWidth > 0 && window.ioq3?.canvas) {
          window.ioq3.setCanvasSize(newWidth, newHeight);
          window.ioq3.canvas.setAttribute(
            "style",
            `object-fit: ${hasGreaterWidth ? "contain" : "scale-down"}`
          );
        }
      },
      maximized || wasMaximized.current
        ? TRANSITIONS_IN_MILLISECONDS.WINDOW + 10
        : 0
    );
  }, [componentWindow, defaultSize, maximized, size, titleBar.height]);

  useEffect(
    () => () => {
      try {
        window.ioq3?.exit();
      } catch {
        // Ignore error on exit
      }

      window.AL?.contexts.forEach(({ ctx }) => ctx.close());
    },
    []
  );
};

export default useQuake3;
