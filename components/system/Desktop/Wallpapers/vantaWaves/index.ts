import type { WallpaperConfig } from "components/system/Desktop/Wallpapers/types";
import {
  disableControls,
  libs,
} from "components/system/Desktop/Wallpapers/vantaWaves/config";
import type { VantaWavesConfig } from "components/system/Desktop/Wallpapers/vantaWaves/types";
import { loadFiles } from "utils/functions";

const vantaWaves = (
  el: HTMLElement | null,
  config: WallpaperConfig = {} as WallpaperConfig
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
      WAVES({
        el,
        ...disableControls,
        ...(config as VantaWavesConfig),
      });
    }
  });
};

export default vantaWaves;
