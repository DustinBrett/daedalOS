import type Byuu from "byuu";
import { keyMap, prettyKey } from "components/apps/Byuu/config";
import useTitle from "components/system/Window/useTitle";
import useWindowSize from "components/system/Window/useWindowSize";
import { useFileSystem } from "contexts/fileSystem";
import { basename } from "path";
import type React from "react";
import { useCallback, useEffect, useRef } from "react";
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
  const { readFile } = useFileSystem();
  const { appendFileToTitle } = useTitle(id);
  const { updateWindowSize } = useWindowSize(id);
  const loadedUrl = useRef<string>("");
  const loadFile = useCallback(
    async (fileUrl: string) => {
      if (!window.byuu || !containerRef.current) return;

      if (window.byuu.isStarted()) {
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

      window.byuu.start();
      appendFileToTitle(`${basename(url)} (${emulatorName})`);
      updateWindowSize(canvas.height, canvas.width);
    },
    [appendFileToTitle, containerRef, readFile, updateWindowSize, url]
  );
  const loadByuu = useCallback(async () => {
    if (!containerRef.current) return;

    window.byuuWasmPath = "/Program Files/Byuu/byuu-web-lib.wasm";

    await loadFiles(["/Program Files/Byuu/byuu.js"]);
    await window.byuu?.initialize(containerRef.current);

    setLoading(false);

    if (url) loadFile(url);
  }, [containerRef, loadFile, setLoading, url]);

  useEffect(() => {
    if (loadedUrl.current !== url) {
      loadedUrl.current = url;
      loadByuu();
    }
  }, [loadByuu, url]);

  useEffect(
    () => () => {
      if (window.byuu?.isStarted()) {
        window.byuu?.terminate();
      }
    },
    []
  );
};

export default useByuu;
