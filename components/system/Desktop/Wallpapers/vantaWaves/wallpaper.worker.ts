import { type OffscreenRenderProps } from "components/system/Desktop/Wallpapers/types";
import { libs } from "components/system/Desktop/Wallpapers/vantaWaves";
import {
  config as vantaConfig,
  disableControls,
} from "components/system/Desktop/Wallpapers/vantaWaves/config";
import {
  type VantaObject,
  type VantaWaves,
  type VantaWavesConfig,
} from "components/system/Desktop/Wallpapers/vantaWaves/types";

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var VANTA: VantaObject;
}

let waveEffect: VantaWaves;

globalThis.addEventListener(
  "message",
  ({ data }: { data: DOMRect | OffscreenRenderProps | string }) => {
    if (typeof WebGLRenderingContext === "undefined") return;

    if (data === "init") {
      globalThis.importScripts(...libs);
    } else if (data instanceof DOMRect) {
      const { width, height } = data;

      waveEffect?.renderer.setSize(width, height);
      waveEffect?.resize();
    } else {
      const { canvas, config, devicePixelRatio } = data as OffscreenRenderProps;
      const { VANTA: { current: currentEffect = waveEffect, WAVES } = {} } =
        globalThis;

      if (!canvas || !WAVES) return;
      if (currentEffect) currentEffect.destroy();

      try {
        const { material, waveSpeed } = config as VantaWavesConfig;
        const wavesConfig = {
          ...vantaConfig,
          waveSpeed: vantaConfig.waveSpeed * waveSpeed,
        };

        wavesConfig.material.options.wireframe = material.options.wireframe;

        waveEffect = WAVES({
          ...wavesConfig,
          ...disableControls,
          canvas,
          devicePixelRatio,
        });
      } catch (error) {
        globalThis.postMessage({
          message: (error as Error)?.message,
          type: "[error]",
        });
      }
    }
  },
  { passive: true }
);
