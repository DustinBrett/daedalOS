import type { VantaWavesConfig } from "components/system/Desktop/Wallpapers/vantaWaves/types";

export type OffscreenRenderProps = {
  canvas: OffscreenCanvas;
  config?: VantaWavesConfig;
  devicePixelRatio: number;
};
