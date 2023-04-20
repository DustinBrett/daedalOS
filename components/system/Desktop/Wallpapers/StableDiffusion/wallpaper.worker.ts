import {
  libs,
  runStableDiffusion,
} from "components/system/Desktop/Wallpapers/StableDiffusion";
import type {
  ITokenizer,
  StableDiffusionConfig,
  TvmjsGlobalEnv,
} from "components/system/Desktop/Wallpapers/StableDiffusion/types";
import type { OffscreenRenderProps } from "components/system/Desktop/Wallpapers/types";

/* eslint-disable vars-on-top, no-var  */
declare global {
  var initalized: boolean;
  var Tokenizer: ITokenizer;
  var tvmjsGlobalEnv: TvmjsGlobalEnv;
}
/* eslint-enable vars-on-top, no-var */

globalThis.initalized = false;

globalThis.addEventListener(
  "message",
  ({ data }: { data: DOMRect | OffscreenRenderProps | string }) => {
    if (data === "init") {
      if (globalThis.initalized) return;

      globalThis.initalized = true;
      globalThis.tvmjsGlobalEnv = globalThis.tvmjsGlobalEnv || {};
      globalThis.importScripts(...libs);
    } else if (!(data instanceof DOMRect)) {
      const { canvas, config } = data as OffscreenRenderProps;

      runStableDiffusion(config as StableDiffusionConfig, canvas, true);
    }
  },
  { passive: true }
);
