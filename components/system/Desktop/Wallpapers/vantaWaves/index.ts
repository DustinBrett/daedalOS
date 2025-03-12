import { type WallpaperConfig } from "components/system/Desktop/Wallpapers/types";
import {
  config as vantaConfig,
  disableControls,
} from "components/system/Desktop/Wallpapers/vantaWaves/config";
import { type VantaWavesConfig } from "components/system/Desktop/Wallpapers/vantaWaves/types";
import { loadFiles } from "utils/functions";

export const libs = [
  "/System/Vanta.js/three.min.js",
  "/System/Vanta.js/vanta.waves.min.js",
];

const vantaWaves = (
  el: HTMLElement | null,
  config?: WallpaperConfig,
  fallback?: () => void
): void => {
  const { VANTA: { current: currentEffect } = {} } = window;

  try {
    currentEffect?.destroy();
  } catch {
    // Failed to cleanup effect
  }

  if (!el || typeof WebGLRenderingContext === "undefined") return;

  loadFiles(libs, true).then(() => {
    const { VANTA: { WAVES } = {} } = window;

    if (WAVES) {
      try {
        const { material, waveSpeed } = config as VantaWavesConfig;
        const wavesConfig = {
          ...vantaConfig,
          waveSpeed: vantaConfig.waveSpeed * waveSpeed,
        };

        wavesConfig.material.options.wireframe = material.options.wireframe;

        WAVES({
          el,
          ...disableControls,
          ...wavesConfig,
        });
      } catch {
        fallback?.();
      }
    }
  });
};

export default vantaWaves;
