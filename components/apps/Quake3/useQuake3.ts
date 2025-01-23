import { useTheme } from "styled-components";
import { useCallback, useEffect, useRef, useState } from "react";
import { type ContainerHookProps } from "components/system/Apps/AppContainer";
import useEmscriptenMount from "components/system/Files/FileManager/useEmscriptenMount";
import { type EmscriptenFS } from "contexts/fileSystem/useAsyncFs";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { PREVENT_SCROLL, TRANSITIONS_IN_MILLISECONDS } from "utils/constants";
import { haltEvent, loadFiles, pxToNum } from "utils/functions";
import useIsolatedContentWindow from "hooks/useIsolatedContentWindow";

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
      viewport: HTMLElement | null;
    };
  }
}

const useQuake3 = ({
  containerRef,
  id,
  setLoading,
  loading,
}: ContainerHookProps): void => {
  const { closeWithTransition, processes: { [id]: process } = {} } =
    useProcesses();
  const {
    componentWindow = undefined,
    defaultSize = {
      height: 0,
      width: 0,
    },
    libs = [],
    maximized = false,
  } = process || {};
  const {
    windowStates: { [id]: windowState },
  } = useSession();
  const {
    sizes: { titleBar },
  } = useTheme();
  const wasMaximized = useRef(false);
  const mountEmFs = useEmscriptenMount();
  const { size } = windowState || {};
  const focusCanvas = useCallback((focusedWindow: Window) => {
    if (focusedWindow?.ioq3?.canvas) {
      focusedWindow.ioq3.canvas.focus(PREVENT_SCROLL);
    } else {
      requestAnimationFrame(() => focusCanvas(focusedWindow));
    }
  }, []);
  const getContentWindow = useIsolatedContentWindow(
    id,
    containerRef,
    focusCanvas,
    `
      body { display: flex; place-content: center; place-items: center; }
      canvas { background-color: #000; height: 100%; width: 100%; }
      canvas:focus-visible { outline: none; }
    `
  );
  const [contentWindow, setContentWindow] = useState<Window>();

  useEffect(() => {
    if (loading) {
      const newContentWindow = getContentWindow?.();

      if (!newContentWindow) return;

      loadFiles(libs, undefined, undefined, undefined, newContentWindow).then(
        () => {
          if (!newContentWindow.ioq3) return;

          newContentWindow.ioq3.viewport = newContentWindow.document.body;
          newContentWindow.ioq3.elementPointerLock = true;
          newContentWindow.ioq3.callMain([]);

          (newContentWindow as Window & { console: Console }).console.log = (
            message: string
          ) => {
            if (message.startsWith("SDL_Quit called")) closeWithTransition(id);
          };

          setLoading(false);

          const initCanvas = (): void => {
            if (newContentWindow.ioq3?.canvas) {
              newContentWindow.ioq3.canvas.addEventListener(
                "contextmenu",
                haltEvent
              );

              setContentWindow(newContentWindow);
              mountEmFs(newContentWindow.FS as EmscriptenFS, id);
            } else {
              requestAnimationFrame(initCanvas);
            }
          };

          initCanvas();
        }
      );
    }
  }, [
    closeWithTransition,
    getContentWindow,
    id,
    libs,
    loading,
    mountEmFs,
    setLoading,
  ]);

  useEffect(() => {
    if (!contentWindow?.ioq3) return;

    const updateSize = (): void => {
      if (!contentWindow.ioq3?.canvas) return;

      wasMaximized.current = maximized;

      const { height, width } =
        (!maximized && size) || componentWindow?.getBoundingClientRect() || {};

      if (!height || !width) return;

      const aspectRatio = defaultSize
        ? pxToNum(defaultSize.width) / pxToNum(defaultSize.height)
        : 4 / 3;
      const numWidth = pxToNum(width);
      const hasGreaterWidth = numWidth > pxToNum(height) - titleBar.height;
      const newWidth =
        maximized && hasGreaterWidth ? numWidth / aspectRatio : numWidth;
      const newHeight = newWidth / aspectRatio;

      if (newHeight > 0 && newWidth > 0) {
        contentWindow.ioq3.setCanvasSize(newWidth, newHeight);
        contentWindow.ioq3.canvas.setAttribute(
          "style",
          `object-fit: ${hasGreaterWidth ? "contain" : "scale-down"}`
        );
      }
    };

    setTimeout(
      updateSize,
      maximized || wasMaximized.current
        ? TRANSITIONS_IN_MILLISECONDS.WINDOW + 10
        : 0
    );
  }, [
    componentWindow,
    contentWindow?.ioq3,
    defaultSize,
    maximized,
    size,
    titleBar.height,
  ]);

  useEffect(
    () => () => {
      try {
        contentWindow?.ioq3?.exit();
      } catch {
        // Ignore error on exit
      }

      contentWindow?.AL?.contexts.forEach(({ ctx }) => ctx.close());
    },
    [contentWindow?.AL?.contexts, contentWindow?.ioq3]
  );
};

export default useQuake3;
