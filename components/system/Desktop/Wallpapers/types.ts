import { type StableDiffusionConfig } from "components/apps/StableDiffusion/types";
import { type VantaWavesConfig } from "components/system/Desktop/Wallpapers/vantaWaves/types";
import { type Size } from "components/system/Window/RndWindow/useResizable";
import type MatrixConfig from "components/system/Desktop/Wallpapers/Matrix/config";

export type WallpaperConfig =
  | Partial<StableDiffusionConfig>
  | Partial<typeof MatrixConfig>
  | VantaWavesConfig;

export type WallpaperFunc = (
  el: HTMLElement | null,
  config?: WallpaperConfig
) => Promise<void> | void;

export type OffscreenRenderProps = {
  canvas: OffscreenCanvas;
  clockSize?: Size;
  config?: Partial<StableDiffusionConfig> | VantaWavesConfig;
  devicePixelRatio: number;
};
