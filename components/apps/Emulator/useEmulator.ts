import { emulatorCores } from "components/apps/Emulator/config";
import type { Emulator } from "components/apps/Emulator/types";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { basename, dirname, extname, join } from "path";
import { useCallback, useEffect, useRef } from "react";
import { ICON_CACHE, ICON_CACHE_EXTENSION, SAVE_PATH } from "utils/constants";
import { bufferToUrl, loadFiles } from "utils/functions";

const getCore = (extension: string): string => {
  const lcExt = extension.toLowerCase();
  const [, { core = "" } = {}] =
    Object.entries(emulatorCores).find(([, { ext }]) => ext.includes(lcExt)) ||
    [];

  return core;
};

const useEmulator = (
  id: string,
  url: string,
  _containerRef: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  loading: boolean
): void => {
  const { exists, mkdirRecursive, readFile, updateFolder, writeFile } =
    useFileSystem();
  const { processes: { [id]: { closing = false } = {} } = {} } = useProcesses();
  const { prependFileToTitle } = useTitle(id);
  const emulatorRef = useRef<Emulator>();
  const initRef = useRef(false);
  const loadRom = useCallback(async () => {
    if (initRef.current || !url) return;
    initRef.current = true;

    const ext = extname(url);

    window.EJS_gameName = basename(url, ext);
    window.EJS_gameUrl = bufferToUrl(await readFile(url));
    window.EJS_core = getCore(ext);

    const saveName = `${basename(url)}.sav`;
    const savePath = join(SAVE_PATH, saveName);

    window.EJS_onGameStart = ({ detail: { emulator: currentEmulator } }) => {
      const loadState = async (): Promise<void> => {
        if (await exists(savePath)) {
          currentEmulator.loadState?.(await readFile(savePath));
        }

        setLoading(false);
        emulatorRef.current = currentEmulator;
      };

      loadState();
    };
    window.EJS_onSaveState = ({ screenshot, state }) => {
      window.EJS_terminate?.();

      const saveState = async (): Promise<void> => {
        if (!(await exists(SAVE_PATH))) await mkdirRecursive(SAVE_PATH);
        if (await writeFile(savePath, Buffer.from(state), true)) {
          const iconCacheRootPath = join(ICON_CACHE, dirname(savePath));
          const iconCachePath = join(
            ICON_CACHE,
            `${savePath}${ICON_CACHE_EXTENSION}`
          );

          if (!(await exists(iconCacheRootPath))) {
            await mkdirRecursive(iconCacheRootPath);
          }
          await writeFile(iconCachePath, Buffer.from(screenshot));
          updateFolder(SAVE_PATH, saveName);
        }
      };

      if (state) saveState();
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

    await loadFiles(["Program Files/EmulatorJs/loader.js"], undefined, true);

    prependFileToTitle(window.EJS_gameName);
  }, [
    exists,
    mkdirRecursive,
    prependFileToTitle,
    readFile,
    setLoading,
    updateFolder,
    url,
    writeFile,
  ]);

  useEffect(() => {
    if (!url) setLoading(false);
    else loadRom();
  }, [loadRom, setLoading, url]);

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
