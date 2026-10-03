import { useEffect, useState } from "react";
import { type ContainerHookProps } from "components/system/Apps/AppContainer";
import useEmscriptenMount from "components/system/Files/FileManager/useEmscriptenMount";
import { type EmscriptenFS } from "contexts/fileSystem/useAsyncFs";
import { useProcess } from "contexts/process";
import useIsolatedContentWindow from "hooks/useIsolatedContentWindow";
import { TRANSITIONS_IN_MILLISECONDS } from "utils/constants";
import { haltEvent, loadFiles } from "utils/functions";

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (): void => {};

// SDL needs an audio context to start, even if it can only be a silent one
class SilentAudioContext {
  public destination = {};

  public sampleRate = 44_100;

  public close = noop;

  public createScriptProcessor = (): Record<string, () => void> => ({
    connect: noop,
    disconnect: noop,
  });
}

const useSpaceCadet = ({
  containerRef,
  id,
  loading,
  setLoading,
}: ContainerHookProps): void => {
  const { libs = [] } = useProcess(id);
  const mountEmFs = useEmscriptenMount();
  const getContentWindow = useIsolatedContentWindow(
    id,
    containerRef,
    undefined,
    "canvas { height: calc(100% + 12px) !important; width: 100% !important; }",
    true
  );
  const [contentWindow, setContentWindow] = useState<Window>();

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (loading) {
      const newContentWindow = getContentWindow?.();

      if (newContentWindow) {
        const canvas = newContentWindow?.document.querySelector(
          "canvas"
        ) as HTMLCanvasElement;

        canvas.addEventListener("contextmenu", haltEvent);

        if (
          !("AudioContext" in newContentWindow) &&
          !("webkitAudioContext" in newContentWindow)
        ) {
          Object.assign(newContentWindow, { AudioContext: SilentAudioContext });
        }

        newContentWindow.Module = {
          canvas,
          postRun: () => {
            setLoading(false);
            setContentWindow(newContentWindow);
            mountEmFs(newContentWindow.FS as EmscriptenFS, id);
          },
          windowElement: newContentWindow.document.body,
        };

        const { height, width } =
          newContentWindow.document.body.getBoundingClientRect() || {};
        let timeoutId: number | undefined;

        if (height && width) {
          canvas.style.height = `${height}px`;
          canvas.style.width = `${width}px`;

          timeoutId = window.setTimeout(
            () =>
              loadFiles(
                libs,
                undefined,
                undefined,
                undefined,
                newContentWindow
              ),
            TRANSITIONS_IN_MILLISECONDS.WINDOW
          );
        }

        cleanup = () => {
          if (timeoutId !== undefined) window.clearTimeout(timeoutId);
        };
      }
    }

    return cleanup;
  }, [getContentWindow, id, libs, loading, mountEmFs, setLoading]);

  useEffect(
    () => () => {
      if (contentWindow?.Module) {
        try {
          contentWindow.Module.SDL2?.audioContext.close();
        } catch {
          // Ignore errors during closing
        }
      }
    },
    [contentWindow?.Module]
  );
};

export default useSpaceCadet;
