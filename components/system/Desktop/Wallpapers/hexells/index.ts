import { loadFiles } from "utils/functions";

declare global {
  interface Window {
    Demo: new (canvas: HTMLCanvasElement) => void;
  }
}

const libs = [
  "System/Hexells/twgl-full.min.js",
  "System/Hexells/dat.gui.min.js",
  "System/Hexells/pako.min.js",
  "System/Hexells/UPNG.min.js",
  "System/Hexells/ca.js",
  "System/Hexells/demo.js",
];

const hexells = async (el?: HTMLElement | null): Promise<void> => {
  if (!el) return;

  await loadFiles(libs);

  const canvas = document.createElement("canvas");

  // eslint-disable-next-line no-new
  new window.Demo(canvas);

  el.appendChild(canvas);
};

export default hexells;
