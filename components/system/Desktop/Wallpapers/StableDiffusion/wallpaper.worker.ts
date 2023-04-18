import {
  initStableDiffusion,
  libs,
} from "components/system/Desktop/Wallpapers/StableDiffusion";
import type {
  ITokenizer,
  StableDiffusionConfig,
  TvmjsGlobalEnv,
} from "components/system/Desktop/Wallpapers/StableDiffusion/types";
import type { OffscreenRenderProps } from "components/system/Desktop/Wallpapers/types";

/* eslint-disable vars-on-top, no-var  */
declare global {
  var Tokenizer: ITokenizer;
  var tvmjsGlobalEnv: TvmjsGlobalEnv;
}
/* eslint-enable vars-on-top, no-var */

globalThis.addEventListener(
  "message",
  ({ data }: { data: DOMRect | OffscreenRenderProps | string }) => {
    if (typeof WebGLRenderingContext === "undefined") return;

    if (data === "init") {
      globalThis.tvmjsGlobalEnv = globalThis.tvmjsGlobalEnv || {};
      globalThis.importScripts(...libs);
    } else if (!(data instanceof DOMRect)) {
      const { canvas, config } = data as OffscreenRenderProps;

      initStableDiffusion(
        config as StableDiffusionConfig,
        canvas as unknown as HTMLCanvasElement
      );
    }
  },
  { passive: true }
);
