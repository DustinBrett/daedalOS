import { loadFiles } from "utils/functions";

declare global {
  interface Window {
    Demo: new (canvas: HTMLCanvasElement, rootPath: string) => unknown;
    Hexells: unknown;
  }
}

export const ROOT_PATH = "/System/Hexells";

export const libs = [
  `${ROOT_PATH}/twgl.min.js`,
  `${ROOT_PATH}/UPNG.min.js`,
  `${ROOT_PATH}/ca.js`,
  `${ROOT_PATH}/demo.js`,
];

const hexells = async (el?: HTMLElement | null): Promise<void> => {
  if (!el) return;

  await loadFiles(libs);

  const canvas = document.createElement("canvas");

  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;

  window.Hexells = new window.Demo(canvas, ROOT_PATH);

  el.append(canvas);
};

export default hexells;
