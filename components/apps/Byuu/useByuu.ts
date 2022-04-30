import type Byuu from "byuu";
import {
  keyMap,
  prettyEmulator,
  prettyKey,
  saveExtension,
} from "components/apps/Byuu/config";
import useTitle from "components/system/Window/useTitle";
import useWindowSize from "components/system/Window/useWindowSize";
import { useFileSystem } from "contexts/fileSystem";
import { basename, join } from "path";
import type React from "react";
import { useCallback, useEffect, useRef } from "react";
import { SAVE_PATH } from "utils/constants";
import { loadFiles } from "utils/functions";

declare global {
  interface Window {
    byuu?: typeof Byuu;
    byuuWasmPath?: string;
  }
}

const pressKey =
  (controller: string, buttons: string[]) =>
  ({ key, type }: KeyboardEvent) => {
    if (keyMap[key] && buttons.includes(keyMap[key])) {
      window.byuu?.setButton(
        controller,
        keyMap[key],
        type === "keydown" ? 1 : 0
      );
    }
  };

const useByuu = (
  id: string,
  url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  const { exists, mkdirRecursive, readFile, updateFolder, writeFile } =
    useFileSystem();
  const { appendFileToTitle } = useTitle(id);
  const { updateWindowSize } = useWindowSize(id);
  const loadedUrl = useRef<string>("");
  const saveState = useRef<() => Promise<void>>();
  const loadFile = useCallback(
    async (fileUrl: string) => {
      if (!window.byuu || !containerRef.current) return;

      if (window.byuu.isStarted()) {
        saveState.current?.();
        window.byuu.unload();
      }

      window.byuu.setEmulatorForFilename(fileUrl);

      const romInfo = window.byuu.load(await readFile(fileUrl));
      const {
        emulator: {
          buttons,
          name: emulatorName,
          ports: [controllerName],
        },
      } = romInfo;
      const gameSavePath = join(
        SAVE_PATH,
        `${basename(fileUrl)}${saveExtension}`
      );

      if (await exists(gameSavePath)) {
        window.byuu.stateLoad(await readFile(gameSavePath));
      }

      const canvas = window.byuu.getCanvas();

      canvas.tabIndex = -1;
      canvas.title = Object.entries(keyMap)
        .map(([key, button]) =>
          buttons.includes(button)
            ? `${button} = ${prettyKey[key] || key}`
            : false
        )
        .filter(Boolean)
        .join("\n");

      canvas.addEventListener("keydown", pressKey(controllerName, buttons));
      canvas.addEventListener("keyup", pressKey(controllerName, buttons));

      if (!window.byuu.connectPeripheral(controllerName, "Gamepad")) return;

      const baseName = basename(url);

      window.byuu.start();
      appendFileToTitle(`${baseName} (${prettyEmulator[emulatorName]})`);
      const multipler = canvas.width > 256 ? 1 : 2;
      updateWindowSize(canvas.height * multipler, canvas.width * multipler);

      saveState.current = async () => {
        if (!window.byuu) return;

        const state = await window.byuu.stateSave();
        const saveName = `${baseName}${saveExtension}`;

        if (!(await exists(SAVE_PATH))) await mkdirRecursive(SAVE_PATH);
        if (
          await writeFile(join(SAVE_PATH, saveName), Buffer.from(state), true)
        ) {
          updateFolder(SAVE_PATH, saveName);
        }
      };
    },
    [
      appendFileToTitle,
      containerRef,
      exists,
      mkdirRecursive,
      readFile,
      updateFolder,
      updateWindowSize,
      url,
      writeFile,
    ]
  );
  const loadByuu = useCallback(async () => {
    if (!containerRef.current) return;

    window.byuuWasmPath = "/Program Files/Byuu/byuu-web-lib.wasm";

    await loadFiles(["/Program Files/Byuu/byuu.js"]);
    await window.byuu?.initialize(containerRef.current);

    setLoading(false);

    if (url) loadFile(url);
    else {
      try {
        window.byuu?.terminate();
      } catch {
        // Ignore errors from pre-post-cleanup
      }
    }
  }, [containerRef, loadFile, setLoading, url]);

  useEffect(() => {
    if (loadedUrl.current !== url || !url) {
      loadedUrl.current = url;
      loadByuu();
    }
  }, [loadByuu, url]);

  useEffect(
    () => () => {
      if (window.byuu?.isStarted()) {
        if (saveState.current) {
          setTimeout(
            () => saveState.current?.().then(() => window.byuu?.terminate()),
            1000
          );
        } else {
          window.byuu?.terminate();
        }
      }
    },
    []
  );
};

export default useByuu;
