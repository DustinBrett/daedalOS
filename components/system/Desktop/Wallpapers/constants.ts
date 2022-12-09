import type { WallpaperFunc } from "components/system/Desktop/Wallpapers/types";
import type { WallpaperFit } from "contexts/session/types";

export const cssFit: Record<WallpaperFit, string> = {
  center: "background-repeat: no-repeat;",
  fill: "background-size: cover;",
  fit: `
    background-repeat: no-repeat;
    background-size: contain;
  `,
  stretch: "background-size: 100% 100%;",
  tile: "",
};

export const WALLPAPER_PATHS: Record<
  string,
  () => Promise<{ default: WallpaperFunc }>
> = {
  COASTAL_LANDSCAPE: () =>
    import("components/system/Desktop/Wallpapers/ShaderToy/CoastalLandscape"),
  HEXELLS: () => import("components/system/Desktop/Wallpapers/hexells"),
  MATRIX: () => import("components/system/Desktop/Wallpapers/Matrix"),
  VANTA: () => import("components/system/Desktop/Wallpapers/vantaWaves"),
};

export const WALLPAPER_WORKERS: Record<string, (info?: string) => Worker> = {
  COASTAL_LANDSCAPE: (): Worker =>
    new Worker(
      new URL(
        "components/system/Desktop/Wallpapers/ShaderToy/CoastalLandscape/wallpaper.worker",
        import.meta.url
      ),
      { name: "Wallpaper (Coastal Landscape)" }
    ),
  HEXELLS: (): Worker =>
    new Worker(
      new URL(
        "components/system/Desktop/Wallpapers/hexells/wallpaper.worker",
        import.meta.url
      ),
      { name: "Wallpaper (Hexells)" }
    ),
  VANTA: (info?: string): Worker =>
    new Worker(
      new URL(
        "components/system/Desktop/Wallpapers/vantaWaves/wallpaper.worker",
        import.meta.url
      ),
      { name: `Wallpaper (Vanta Waves)${info ? ` [${info}]` : ""}` }
    ),
};

export const BASE_CANVAS_SELECTOR = ":scope > canvas";
