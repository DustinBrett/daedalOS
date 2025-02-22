import matrixConfig from "components/system/Desktop/Wallpapers/Matrix/config";
import { type WallpaperConfig } from "components/system/Desktop/Wallpapers/types";
import { loadFiles } from "utils/functions";

export const libs = ["/System/Matrix/js/regl/main.js"];

declare global {
  interface Window {
    Matrix: (
      canvas: HTMLCanvasElement,
      config: typeof matrixConfig
    ) => Promise<void>;
  }
}

const Matrix = async (
  el?: HTMLElement | null,
  config: WallpaperConfig = {} as WallpaperConfig
): Promise<void> => {
  if (!el) return;

  const canvas = document.createElement("canvas");

  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;

  el.append(canvas);

  await loadFiles(libs, undefined, undefined, true);

  await window.Matrix?.(canvas, { ...matrixConfig, ...config });
};

export default Matrix;
