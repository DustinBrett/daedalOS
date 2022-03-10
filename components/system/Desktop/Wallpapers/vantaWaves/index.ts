import {
  disableControls,
  isWebGLAvailable,
  libs,
} from "components/system/Desktop/Wallpapers/vantaWaves/config";
import type { VantaWavesConfig } from "components/system/Desktop/Wallpapers/vantaWaves/types";
import { loadFiles } from "utils/functions";

const vantaWaves =
  (config: VantaWavesConfig) =>
  (el?: HTMLElement | null): void => {
    const { VANTA: { current: currentEffect } = {} } = window;

    currentEffect?.destroy();

    if (!el) return;

    loadFiles(libs, true).then(() => {
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
