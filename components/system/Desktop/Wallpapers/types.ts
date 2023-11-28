import { type StableDiffusionConfig } from "components/apps/StableDiffusion/types";
import { type Size } from "components/system/Window/RndWindow/useResizable";
import type MatrixConfig from "components/system/Desktop/Wallpapers/Matrix/config";
import { type VantaNetConfig } from "components/system/Desktop/Wallpapers/vantaNet/types";

export type WallpaperConfig =
  | Partial<StableDiffusionConfig>
  | Partial<typeof MatrixConfig>
  | VantaNetConfig;

export type WallpaperFunc = (
  el: HTMLElement | null,
  config?: WallpaperConfig
) => Promise<void> | void;

export type OffscreenRenderProps = {
  canvas: OffscreenCanvas;
  clockSize?: Size;
  config?: Partial<StableDiffusionConfig> | VantaNetConfig;
  devicePixelRatio: number;
};
