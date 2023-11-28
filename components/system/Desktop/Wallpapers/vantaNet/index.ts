import { type WallpaperConfig } from "components/system/Desktop/Wallpapers/types";
import {
  disableControls,
  libs,
} from "components/system/Desktop/Wallpapers/vantaNet/config";
import { type VantaNetConfig } from "components/system/Desktop/Wallpapers/vantaNet/types";
import { loadFiles } from "utils/functions";

const vantaNet = (
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
    const { VANTA: { NET } = {} } = window;

    if (NET) {
      NET({
        el,
        ...disableControls,
        ...(config as VantaNetConfig),
      });
    }
  });
};

export default vantaNet;
