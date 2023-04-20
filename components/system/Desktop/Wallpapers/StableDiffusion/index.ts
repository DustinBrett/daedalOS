import type { WallpaperConfig } from "components/system/Desktop/Wallpapers/types";
import { loadFiles } from "utils/functions";
import type { StableDiffusionConfig } from "./types";

export const libs = [
  "/System/StableDiffusion/tvmjs_runtime.wasi.js",
  "/System/StableDiffusion/tvmjs.bundle.js",
  "/System/StableDiffusion/tokenizers-wasm/tokenizers_wasm.js",
  "/System/StableDiffusion/stable_diffusion.js",
];

export const runStableDiffusion = async (
  config: StableDiffusionConfig,
  canvas: HTMLCanvasElement | OffscreenCanvas,
  skipLibs = false
): Promise<void> => {
  if (!skipLibs) {
    window.tvmjsGlobalEnv = window.tvmjsGlobalEnv || {};

    await loadFiles(libs);
  }

  globalThis.tvmjsGlobalEnv.getTokenizer = async () => {
    if (!globalThis.tvmjsGlobalEnv.initialized) {
      await globalThis.Tokenizer.init();
    }

    globalThis.tvmjsGlobalEnv.initialized = true;

    return new globalThis.Tokenizer.TokenizerWasm(
      await (
        await fetch("/System/StableDiffusion/tokenizers-wasm/tokenizer.json")
      ).text()
    );
  };

  globalThis.tvmjsGlobalEnv.canvas = globalThis.tvmjsGlobalEnv.canvas || canvas;

  const { prompts } = config;

  globalThis.tvmjsGlobalEnv.prompts = prompts?.length
    ? prompts
    : [["A photo of an astronaut riding a horse on mars", ""]];

  await globalThis.tvmjsGlobalEnv.asyncOnGenerate();
};

const StableDiffusion = (
  el?: HTMLElement | null,
  config: WallpaperConfig = {} as WallpaperConfig
): void => {
  if (!el) return;

  const canvas = document.createElement("canvas");

  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;

  el.append(canvas);

  runStableDiffusion(config as StableDiffusionConfig, canvas);
};

export default StableDiffusion;
