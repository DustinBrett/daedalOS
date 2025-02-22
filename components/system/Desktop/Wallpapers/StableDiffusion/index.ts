import { type StableDiffusionConfig } from "components/apps/StableDiffusion/types";
import { type WallpaperConfig } from "components/system/Desktop/Wallpapers/types";
import { loadFiles } from "utils/functions";

export const libs = [
  "/System/tvm/tvmjs_runtime.wasi.js",
  "/System/tvm/tvmjs.bundle.js",
  "/Program Files/StableDiffusion/tokenizers-wasm/tokenizers_wasm.js",
  "/Program Files/StableDiffusion/stable_diffusion.js",
];

export const runStableDiffusion = async (
  config: StableDiffusionConfig,
  canvas: HTMLCanvasElement | OffscreenCanvas,
  skipLibs = false,
  reUseCanvas = true
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
        await fetch(
          "/Program Files/StableDiffusion/tokenizers-wasm/tokenizer.json"
        )
      ).text()
    );
  };

  if (!reUseCanvas) {
    globalThis.tvmjsGlobalEnv.canvas = undefined;
  }

  globalThis.tvmjsGlobalEnv.canvas = globalThis.tvmjsGlobalEnv.canvas || canvas;

  const { prompts } = config;

  globalThis.tvmjsGlobalEnv.prompts = prompts?.length
    ? prompts
    : [["A photo of an astronaut riding a elephant on jupiter", ""]];

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
