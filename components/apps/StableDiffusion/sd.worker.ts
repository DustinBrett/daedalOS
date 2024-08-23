import { type StableDiffusionConfig } from "components/apps/StableDiffusion/types";
import {
  libs,
  runStableDiffusion,
} from "components/system/Desktop/Wallpapers/StableDiffusion";
import { type OffscreenRenderProps } from "components/system/Desktop/Wallpapers/types";

globalThis.addEventListener(
  "message",
  ({ data }: { data: DOMRect | OffscreenRenderProps | string }) => {
    if (data === "init") {
      globalThis.tvmjsGlobalEnv = globalThis.tvmjsGlobalEnv || {};
      globalThis.tvmjsGlobalEnv.logger = (type: string, message: string) => {
        if (type || message) console.info(`${type}: ${message}`);
        globalThis.postMessage({ message, type });
      };

      globalThis.importScripts(...libs);
    } else if (!(data instanceof DOMRect)) {
      const { canvas, config } = data as OffscreenRenderProps;

      runStableDiffusion(config as StableDiffusionConfig, canvas, true).then(
        () => globalThis.tvmjsGlobalEnv.logger("", "")
      );
    }
  },
  { passive: true }
);
