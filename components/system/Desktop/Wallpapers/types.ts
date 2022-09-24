import type { VantaWavesConfig } from "components/system/Desktop/Wallpapers/vantaWaves/types";
import type { Size } from "components/system/Window/RndWindow/useResizable";

export type WallpaperFunc = (
  el: HTMLElement | null,
  config?: VantaWavesConfig
) => Promise<void>;

export type OffscreenRenderProps = {
  canvas: OffscreenCanvas;
  clockSize?: Size;
  config?: VantaWavesConfig;
  devicePixelRatio: number;
};
