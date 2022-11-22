import { loadFiles } from "utils/functions";

declare global {
  interface Window {
    Demo: new (canvas: HTMLCanvasElement) => unknown;
    Hexells: unknown;
  }
}

export const libs = [
  "/System/Hexells/twgl-full.min.js",
  "/System/Hexells/pako.min.js",
  "/System/Hexells/UPNG.min.js",
  "/System/Hexells/ca.js",
  "/System/Hexells/demo.js",
];

const hexells = async (el?: HTMLElement | null): Promise<void> => {
  if (!el) return;

  await loadFiles(libs);

  const canvas = document.createElement("canvas");

  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;

  window.Hexells = new window.Demo(canvas);

  el.append(canvas);
};

export default hexells;
