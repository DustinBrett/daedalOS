import {
  config,
  disableControls,
  isWebGLAvailable,
  libs,
} from "components/system/Desktop/Wallpapers/vantaWaves/config";
import type {
  OffscreenRenderProps,
  VantaObject,
  VantaWaves,
} from "components/system/Desktop/Wallpapers/vantaWaves/types";

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var VANTA: VantaObject;
  function importScripts(...urls: string[]): void;
}

let waveEffect: VantaWaves;

globalThis.addEventListener(
  "message",
  ({ data }: { data: DOMRect | OffscreenRenderProps | string }) => {
    if (!isWebGLAvailable) return;

    if (data === "init") {
      importScripts(...libs);
    } else if (data instanceof DOMRect) {
      const { width, height } = data;

      waveEffect?.renderer.setSize(width, height);
      waveEffect?.resize();
    } else {
      const { canvas, devicePixelRatio } = data as OffscreenRenderProps;
      const { VANTA: { current: currentEffect = waveEffect, WAVES } = {} } =
        globalThis;

      if (!canvas || !WAVES) return;
      if (currentEffect) currentEffect.destroy();

      waveEffect = WAVES({
        ...config,
        ...disableControls,
        canvas,
        devicePixelRatio,
      });
    }
  },
  { passive: true }
);
