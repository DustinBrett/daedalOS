import {
  libs,
  runStableDiffusion,
} from "components/system/Desktop/Wallpapers/StableDiffusion";
import type { StableDiffusionConfig } from "components/system/Desktop/Wallpapers/StableDiffusion/types";
import type { OffscreenRenderProps } from "components/system/Desktop/Wallpapers/types";

globalThis.addEventListener(
  "message",
  ({ data }: { data: DOMRect | OffscreenRenderProps | string }) => {
    if (data === "init") {
      globalThis.tvmjsGlobalEnv = globalThis.tvmjsGlobalEnv || {};
      globalThis.importScripts(...libs);
    } else if (!(data instanceof DOMRect)) {
      const { canvas, config } = data as OffscreenRenderProps;

      runStableDiffusion(config as StableDiffusionConfig, canvas, true);
    }
  },
  { passive: true }
);
