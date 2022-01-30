import type {
  OffscreenRenderProps,
  VantaObject,
  VantaWavesSettings,
} from "components/system/Desktop/Wallpapers/vantaWaves/types";

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var VANTA: VantaObject;
  function importScripts(url: string): void;
}

const vantaWorker = (): void => {
  globalThis.addEventListener(
    "message",
    ({ data }: { data: OffscreenRenderProps | string }) => {
      if (data === "init") {
        const libs = [
          "/System/Vanta.js/three.min.js",
          "/System/Vanta.js/vanta.waves.min.js",
        ];

        libs.forEach((lib) =>
          globalThis.importScripts(`${globalThis.location.origin}${lib}`)
        );
      } else {
        const { canvas, devicePixelRatio } = data as OffscreenRenderProps;

        if (canvas) {
          const baseConfig = {
            forceAnimate: true,
            shininess: 35,
            waveHeight: 15,
            waveSpeed: 0.25,
          };
          const colorConfig = {
            color: 0x192b34,
            colorCycleSpeed: 5,
            hue: 200,
            lightness: 15,
            saturation: 35,
          };
          const disableControls = {
            gyroControls: false,
            mouseControls: false,
            mouseEase: false,
            touchControls: false,
          };
          const { VANTA: { current: currentEffect, WAVES } = {} } = globalThis;
          const isWebGLAvailable = typeof WebGLRenderingContext !== "undefined";

          if (isWebGLAvailable && WAVES) {
            if (currentEffect) currentEffect.destroy();

            WAVES(
              Object.assign(baseConfig, colorConfig, disableControls, {
                canvas,
                devicePixelRatio,
              }) as VantaWavesSettings
            );
          }
        }
      }
    },
    { passive: true }
  );
};

export default vantaWorker;
