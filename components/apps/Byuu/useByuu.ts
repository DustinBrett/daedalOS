import type Byuu from "byuu";
import type { Emulator } from "byuu";
import { useFileSystem } from "contexts/fileSystem";
import { useCallback, useEffect } from "react";
import { loadFiles } from "utils/functions";

declare global {
  interface Window {
    byuu?: typeof Byuu;
    byuuWasmPath?: string;
  }
}

const defaultController = "Controller Port 1";

const keyMap: Record<string, string> = {
  A: "A",
  ArrowDown: "Down",
  ArrowLeft: "Left",
  ArrowRight: "Right",
  ArrowUp: "Up",
  B: "B",
  Backspace: "Select",
  Enter: "Start",
  a: "A",
  b: "B",
};

const pressKey = (isDown: boolean) => (key: string, buttons: string[]) => {
  if (keyMap[key] && buttons.includes(keyMap[key])) {
    window.byuu?.setButton(defaultController, keyMap[key], isDown ? 1 : 0);
  }
};

const useByuu = (
  _id: string,
  url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  const { readFile } = useFileSystem();
  const loadFile = useCallback(
    async (fileUrl: string) => {
      if (!window.byuu || !containerRef.current) return;

      window.byuu.setEmulator(
        window.byuu.getEmulatorForFilename(fileUrl) as Emulator
      );

      const romInfo = window.byuu.load(await readFile(fileUrl));
      const canvas = containerRef.current.querySelector("canvas");

      if (!canvas) return;

      canvas.tabIndex = -1;
      canvas.addEventListener("keydown", ({ key }) =>
        pressKey(true)(key, romInfo.emulator.buttons)
      );
      canvas.addEventListener("keyup", ({ key }) =>
        pressKey(false)(key, romInfo.emulator.buttons)
      );

      window.byuu.connectPeripheral(defaultController, "Gamepad");
      window.byuu.start();
    },
    [containerRef, readFile]
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
    loadByuu();
  }, [loadByuu]);

  useEffect(
    () => () => {
      window.byuu?.terminate();
    },
    []
  );
};

export default useByuu;
