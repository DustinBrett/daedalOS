import { basename, extname, join } from "path";
import { useCallback, useEffect, useRef } from "react";
import { type Core, emulatorCores } from "components/apps/Emulator/config";
import {
  type OnGameStart,
  type OnSaveState,
  type Emulator,
} from "components/apps/Emulator/types";
import { type ContainerHookProps } from "components/system/Apps/AppContainer";
import useEmscriptenMount from "components/system/Files/FileManager/useEmscriptenMount";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { type EmscriptenFS } from "contexts/fileSystem/useAsyncFs";
import { useProcesses } from "contexts/process";
import { SAVE_PATH } from "utils/constants";
import { bufferToUrl, getExtension, loadFiles } from "utils/functions";
import { zipAsync } from "utils/zipFunctions";
import { useSnapshots } from "hooks/useSnapshots";
import useIsolatedContentWindow from "hooks/useIsolatedContentWindow";

const getCore = (extension: string): [string, Core] =>
  (Object.entries(emulatorCores).find(([, { ext }]) =>
    ext.includes(extension)
  ) || []) as [string, Core];

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const withWindowConstructor = <F extends Function>(
  fn: F,
  context: Window
): F => {
  if ("Function" in context) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type, no-param-reassign
    fn.constructor = context.Function as Function;
  }

  return fn;
};

const useEmulator = ({
  containerRef,
  id,
  loading,
  setLoading,
  url,
}: ContainerHookProps): void => {
  const { exists, readFile } = useFileSystem();
  const { createSnapshot } = useSnapshots();
  const mountEmFs = useEmscriptenMount();
  const { linkElement, processes: { [id]: { closing, libs = [] } = {} } = {} } =
    useProcesses();
  const { prependFileToTitle } = useTitle(id);
  const emulatorRef = useRef<Emulator>(undefined);
  const getContentWindow = useIsolatedContentWindow(id, containerRef);
  const loadedUrl = useRef<string>(undefined);
  const loadRom = useCallback(
    async (fileUrl: string) => {
      const contentWindow = getContentWindow?.();

      if (!contentWindow) return;

      loadedUrl.current = fileUrl;

      setLoading(true);

      containerRef.current?.classList.remove("drop");

      try {
        contentWindow.EJS_terminate?.();
      } catch {
        // Ignore errors during termination
      }

      [...contentWindow.document.body.children].forEach((child) =>
        child.remove()
      );
      const div = contentWindow.document.createElement("div");
      div.id = "emulator";
      div.style.placeContent = "center";
      contentWindow.document.body.append(div);

      contentWindow.EJS_gameName = basename(fileUrl, extname(fileUrl));

      const [consoleName, { core = "", zip = false } = {}] = getCore(
        getExtension(fileUrl)
      );
      const rom = await readFile(fileUrl);

      contentWindow.EJS_gameUrl = bufferToUrl(
        zip ? Buffer.from(await zipAsync({ [basename(fileUrl)]: rom })) : rom
      );
      contentWindow.EJS_core = core;

      const saveName = `${basename(fileUrl)}.sav`;
      const savePath = join(SAVE_PATH, saveName);

      contentWindow.EJS_onGameStart = withWindowConstructor<OnGameStart>(
        ({ detail: { emulator: currentEmulator } }) => {
          const loadState = async (): Promise<void> => {
            if (await exists(savePath)) {
              currentEmulator.loadState?.(await readFile(savePath));
            }

            setLoading(false);
            mountEmFs(
              contentWindow.FS as EmscriptenFS,
              `EmulatorJs_${contentWindow.EJS_gameName}`
            );
            emulatorRef.current = currentEmulator;

            const canvas =
              currentEmulator.elements?.container?.querySelector("canvas");

            if (canvas) {
              linkElement(id, "peekElement", canvas);
            }
          };

          loadState();
        },
        contentWindow
      );
      contentWindow.EJS_onSaveState = withWindowConstructor<OnSaveState>(
        ({ screenshot, state }) => {
          contentWindow.EJS_terminate?.();

          if (state) {
            createSnapshot(
              saveName,
              Buffer.from(state),
              Buffer.from(screenshot)
            );
          }
        },
        contentWindow
      );
      contentWindow.EJS_player = "#emulator";
      contentWindow.EJS_biosUrl = "";
      contentWindow.EJS_pathtodata = "Program Files/EmulatorJs/";
      contentWindow.EJS_startOnLoaded = true;
      contentWindow.EJS_RESET_VARS = true;
      contentWindow.EJS_Buttons = {
        cacheManage: false,
        loadState: false,
        quickLoad: false,
        quickSave: false,
        saveState: false,
        screenRecord: false,
        screenshot: false,
      };

      await loadFiles(libs, undefined, undefined, undefined, contentWindow);

      prependFileToTitle(`${contentWindow.EJS_gameName} (${consoleName})`);
    },
    [
      containerRef,
      createSnapshot,
      exists,
      getContentWindow,
      id,
      libs,
      linkElement,
      mountEmFs,
      prependFileToTitle,
      readFile,
      setLoading,
    ]
  );

  useEffect(() => {
    if (url) {
      if (url !== loadedUrl.current) loadRom(url);
    } else if (!closing) {
      setLoading(false);
      containerRef.current?.classList.add("drop");
    }
  }, [closing, containerRef, loadRom, setLoading, url]);

  useEffect(
    () => () => {
      if (!loading && closing) {
        emulatorRef.current?.elements.buttons.saveState?.click();
      }
    },
    [closing, loading]
  );
};

export default useEmulator;
