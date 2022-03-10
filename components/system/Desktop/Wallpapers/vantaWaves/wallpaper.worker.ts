import {
  config,
  disableControls,
  isWebGLAvailable,
  libs,
} from "components/system/Desktop/Wallpapers/vantaWaves/config";
import type {
  OffscreenRenderProps,
  VantaObject,
} from "components/system/Desktop/Wallpapers/vantaWaves/types";

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var VANTA: VantaObject;
  function importScripts(...urls: string[]): void;
}

globalThis.addEventListener(
  "message",
  ({ data }: { data: OffscreenRenderProps | string }) => {
    if (!isWebGLAvailable) return;

    if (data === "init") {
      importScripts(...libs);
    } else {
      const { canvas, devicePixelRatio } = data as OffscreenRenderProps;
      const { VANTA: { current: currentEffect, WAVES } = {} } = globalThis;

      if (!canvas || !WAVES) return;
      if (currentEffect) currentEffect.destroy();

      WAVES({
        ...config,
        ...disableControls,
        canvas,
        devicePixelRatio,
      });
    }
  },
  { passive: true }
);
