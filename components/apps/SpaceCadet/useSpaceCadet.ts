import { useEffect, useState } from "react";
import { type ContainerHookProps } from "components/system/Apps/AppContainer";
import useEmscriptenMount from "components/system/Files/FileManager/useEmscriptenMount";
import { type EmscriptenFS } from "contexts/fileSystem/useAsyncFs";
import { useProcesses } from "contexts/process";
import { haltEvent, loadFiles } from "utils/functions";
import useIsolatedContentWindow from "hooks/useIsolatedContentWindow";
import { TRANSITIONS_IN_MILLISECONDS } from "utils/constants";

const useSpaceCadet = ({
  containerRef,
  id,
  setLoading,
  loading,
}: ContainerHookProps): void => {
  const { processes: { [id]: { libs = [] } = {} } = {} } = useProcesses();
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
    if (loading) {
      const newContentWindow = getContentWindow?.();

      if (!newContentWindow) return;

      const canvas = newContentWindow?.document.querySelector(
        "canvas"
      ) as HTMLCanvasElement;

      canvas.addEventListener("contextmenu", haltEvent);

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

      if (height && width) {
        canvas.style.height = `${height}px`;
        canvas.style.width = `${width}px`;

        setTimeout(
          () =>
            loadFiles(libs, undefined, undefined, undefined, newContentWindow),
          TRANSITIONS_IN_MILLISECONDS.WINDOW
        );
      }
    }
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
