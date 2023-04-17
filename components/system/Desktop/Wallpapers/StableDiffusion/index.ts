import type { WallpaperConfig } from "components/system/Desktop/Wallpapers/types";
import { loadFiles } from "utils/functions";
import type { StableDiffusionConfig } from "./types";

const tvmLibs = [
  "/System/StableDiffusion/tvmjs_runtime.wasi.js",
  "/System/StableDiffusion/tvmjs.bundle.js",
];

const moduleLibs = [
  "System/StableDiffusion/tokenizers-wasm/tokenizers_wasm.js",
];

const libs = ["/System/StableDiffusion/stable_diffusion.js"];

declare global {
  interface Window {
    Tokenizer: {
      TokenizerWasm: new (config: string) => (name: string) => Promise<unknown>;
      init: () => Promise<void>;
    };
    tvmjsGlobalEnv: {
      asyncOnGenerate: () => Promise<void>;
      canvas: HTMLCanvasElement;
      getTokenizer: (name: string) => Promise<unknown>;
      initialized: boolean;
      prompts: [string, string][];
      update: () => Promise<void>;
      updateMins: number;
    };
  }
}

const StableDiffusion = async (
  el?: HTMLElement | null,
  config: WallpaperConfig = {} as WallpaperConfig
): Promise<void> => {
  if (!el) return;

  const canvas = document.createElement("canvas");

  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;

  el.append(canvas);

  await loadFiles(tvmLibs);

  window.tvmjsGlobalEnv = window.tvmjsGlobalEnv || {};

  await loadFiles(moduleLibs, undefined, undefined, true);

  window.tvmjsGlobalEnv.getTokenizer = async () => {
    if (!window.tvmjsGlobalEnv.initialized) {
      await window.Tokenizer.init();
    }

    window.tvmjsGlobalEnv.initialized = true;

    return new window.Tokenizer.TokenizerWasm(
      await (
        await fetch("/System/StableDiffusion/tokenizers-wasm/tokenizer.json")
      ).text()
    );
  };

  await loadFiles(libs);

  window.tvmjsGlobalEnv.canvas = canvas;

  const { prompts, update, updateMins } = config as StableDiffusionConfig;

  window.tvmjsGlobalEnv.prompts = prompts?.length
    ? prompts
    : [["A photo of an astronaut riding a horse on mars", ""]];

  if (update) window.tvmjsGlobalEnv.update = update;
  if (updateMins) window.tvmjsGlobalEnv.updateMins = updateMins;

  window.tvmjsGlobalEnv.asyncOnGenerate();
};

export default StableDiffusion;
