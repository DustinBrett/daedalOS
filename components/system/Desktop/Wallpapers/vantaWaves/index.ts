import type { VantaWavesConfig } from "components/system/Desktop/Wallpapers/vantaWaves/types";
import { loadFiles } from "utils/functions";

const disableControls = {
  gyroControls: false,
  mouseControls: false,
  mouseEase: false,
  touchControls: false,
};

const isWebGLAvailable = typeof WebGLRenderingContext !== "undefined";

const libs = [
  "/System/Vanta.js/three.min.js",
  "/System/Vanta.js/vanta.waves.min.js",
];

const vantaWaves =
  (config: VantaWavesConfig) =>
  (el?: HTMLElement | null): void => {
    const { VANTA: { current: currentEffect } = {} } = window;

    currentEffect?.destroy();

    if (!el) return;

    loadFiles(libs).then(() => {
      const { VANTA: { WAVES } = {} } = window;

      if (isWebGLAvailable && WAVES) {
        WAVES({
          el,
          ...disableControls,
          ...config,
        });
      }
    });
  };

export default vantaWaves;
