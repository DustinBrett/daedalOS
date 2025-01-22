import { useTheme } from "styled-components";
import { useEffect, useState } from "react";
import { type ContainerHookProps } from "components/system/Apps/AppContainer";
import useEmscriptenMount from "components/system/Files/FileManager/useEmscriptenMount";
import { type EmscriptenFS } from "contexts/fileSystem/useAsyncFs";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { TRANSITIONS_IN_MILLISECONDS } from "utils/constants";
import { haltEvent, loadFiles, pxToNum } from "utils/functions";
import useIsolatedContentWindow from "hooks/useIsolatedContentWindow";

declare global {
  interface Window {
    CCModule: {
      OnResize?: () => void;
      arguments: string[];
      canvas: HTMLCanvasElement;
      postRun: (() => void)[];
      print: () => void;
      setCanvasSize?: (width: number, height: number) => void;
      setStatus: () => void;
      windowElement: HTMLElement;
    };
  }
}

const useClassiCube = ({
  containerRef,
  id,
  setLoading,
  loading,
}: ContainerHookProps): void => {
  const { processes: { [id]: process } = {} } = useProcesses();
  const mountEmFs = useEmscriptenMount();
  const {
    windowStates: { [id]: windowState },
  } = useSession();
  const { size } = windowState || {};
  const { componentWindow, libs, maximized } = process || {};
  const {
    sizes: { titleBar },
  } = useTheme();
  const getContentWindow = useIsolatedContentWindow(
    id,
    containerRef,
    undefined,
    "canvas { height: 100%; width: 100%; }",
    true
  );
  const [contentWindow, setContentWindow] = useState<Window>();

  useEffect(() => {
    setTimeout(() => {
      let currentSize = size;

      if (!currentSize && componentWindow) {
        const { height, width } = componentWindow.getBoundingClientRect();

        currentSize = { height, width };
      }

      if (currentSize) {
        contentWindow?.CCModule.setCanvasSize?.(
          pxToNum(currentSize.width),
          pxToNum(currentSize.height) - titleBar.height
        );
        contentWindow?.CCModule.OnResize?.();
      }
    }, TRANSITIONS_IN_MILLISECONDS.WINDOW);
    // eslint-disable-next-line react-hooks-addons/no-unused-deps
  }, [
    componentWindow,
    contentWindow?.CCModule,
    maximized,
    size,
    titleBar.height,
  ]);

  useEffect(() => {
    if (loading) {
      const newContentWindow = getContentWindow?.();

      if (!newContentWindow) return;

      const canvas = newContentWindow?.document.querySelector(
        "canvas"
      ) as HTMLCanvasElement;

      canvas.addEventListener("contextmenu", haltEvent);

      newContentWindow.CCModule = {
        arguments: ["Singleplayer"],
        canvas,
        postRun: [
          () => {
            setLoading(false);
            setContentWindow(newContentWindow);
            mountEmFs(newContentWindow.FS as EmscriptenFS, id);
          },
          () => {
            const { width, height } = canvas.getBoundingClientRect() || {};

            canvas.width = width;
            canvas.height = height;
          },
        ],
        print: console.info,
        setStatus: console.info,
        windowElement: newContentWindow.document.body,
      };

      loadFiles(libs, undefined, undefined, undefined, newContentWindow);
    }
  }, [getContentWindow, id, libs, loading, mountEmFs, setLoading]);
};

export default useClassiCube;
