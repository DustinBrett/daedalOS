import { basename, extname, join } from "path";
import { useCallback, useEffect, useRef } from "react";
import { type Core, emulatorCores } from "components/apps/Emulator/config";
import { type Emulator } from "components/apps/Emulator/types";
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

const getCore = (extension: string): [string, Core] =>
  (Object.entries(emulatorCores).find(([, { ext }]) =>
    ext.includes(extension)
  ) || []) as [string, Core];

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
  const {
    linkElement,
    processes: { [id]: { closing = false, libs = [] } = {} } = {},
  } = useProcesses();
  const { prependFileToTitle } = useTitle(id);
  const emulatorRef = useRef<Emulator>(undefined);
  const loadedUrlRef = useRef<string>("");
  const loadRom = useCallback(async () => {
    if (!url) return;

    containerRef.current?.classList.remove("drop");

    if (loadedUrlRef.current) {
      if (loadedUrlRef.current !== url) {
        loadedUrlRef.current = "";

        try {
          window.EJS_terminate?.();
        } catch {
          // Ignore errors during termination
        }

        if (containerRef.current) {
          const div = document.createElement("div");

          div.id = "emulator";
          [...containerRef.current.children].forEach((child) => child.remove());
          containerRef.current.append(div);
          loadRom();
        }
      }

      return;
    }

    loadedUrlRef.current = url;
    window.EJS_gameName = basename(url, extname(url));

    const [consoleName, { core = "", zip = false } = {}] = getCore(
      getExtension(url)
    );
    const rom = await readFile(url);

    window.EJS_gameUrl = bufferToUrl(
      zip ? Buffer.from(await zipAsync({ [basename(url)]: rom })) : rom
    );
    window.EJS_core = core;

    const saveName = `${basename(url)}.sav`;
    const savePath = join(SAVE_PATH, saveName);

    window.EJS_onGameStart = ({ detail: { emulator: currentEmulator } }) => {
      const loadState = async (): Promise<void> => {
        if (await exists(savePath)) {
          currentEmulator.loadState?.(await readFile(savePath));
        }

        setLoading(false);
        mountEmFs(window.FS as EmscriptenFS, "EmulatorJs");
        emulatorRef.current = currentEmulator;
      };

      loadState();
    };
    window.EJS_onSaveState = ({ screenshot, state }) => {
      window.EJS_terminate?.();

      if (state) {
        createSnapshot(saveName, Buffer.from(state), Buffer.from(screenshot));
      }
    };

    window.EJS_player = "#emulator";
    window.EJS_biosUrl = "";
    window.EJS_pathtodata = "Program Files/EmulatorJs/";
    window.EJS_startOnLoaded = true;
    window.EJS_RESET_VARS = true;
    window.EJS_Buttons = {
      cacheManage: false,
      loadState: false,
      quickLoad: false,
      quickSave: false,
      saveState: false,
      screenRecord: false,
      screenshot: false,
    };

    await loadFiles(libs, undefined, true);

    prependFileToTitle(`${window.EJS_gameName} (${consoleName})`);
  }, [
    containerRef,
    createSnapshot,
    exists,
    libs,
    mountEmFs,
    prependFileToTitle,
    readFile,
    setLoading,
    url,
  ]);

  useEffect(() => {
    if (url) loadRom();
    else {
      setLoading(false);
      mountEmFs(window.FS as EmscriptenFS, "EmulatorJs");
      containerRef.current?.classList.add("drop");
    }
  }, [containerRef, loadRom, mountEmFs, setLoading, url]);

  useEffect(() => {
    if (!loading) {
      const canvas = containerRef.current?.querySelector("canvas");

      if (canvas instanceof HTMLCanvasElement) {
        linkElement(id, "peekElement", canvas);
      }
    }

    return () => {
      if (!loading && closing) {
        emulatorRef.current?.elements.buttons.saveState?.click();
      }
    };
  }, [closing, containerRef, id, linkElement, loading]);
};

export default useEmulator;
