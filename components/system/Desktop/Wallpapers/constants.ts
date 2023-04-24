import type { WallpaperFunc } from "components/system/Desktop/Wallpapers/types";
import type { WallpaperFit } from "contexts/session/types";

export const bgPositionSize: Record<WallpaperFit, string> = {
  center: "center center",
  fill: "center center / cover",
  fit: "center center / contain",
  stretch: "center center / 100% 100%",
  tile: "50% 50%",
};

export const WALLPAPER_PATHS: Record<
  string,
  () => Promise<{ default: WallpaperFunc }>
> = {
  COASTAL_LANDSCAPE: () =>
    import("components/system/Desktop/Wallpapers/ShaderToy/CoastalLandscape"),
  HEXELLS: () => import("components/system/Desktop/Wallpapers/hexells"),
  MATRIX: () => import("components/system/Desktop/Wallpapers/Matrix"),
  STABLE_DIFFUSION: () =>
    import("components/system/Desktop/Wallpapers/StableDiffusion"),
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
  STABLE_DIFFUSION: (): Worker =>
    new Worker(
      new URL("components/apps/StableDiffusion/sd.worker", import.meta.url),
      { name: "Wallpaper (Stable Diffusion)" }
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

type WallpaperMenuItem = {
  id: string;
  name?: string;
  requiresWebGPU?: boolean;
  startsWith?: boolean;
};

export const WALLPAPER_MENU: WallpaperMenuItem[] = [
  {
    id: "APOD",
    startsWith: true,
  },
  {
    id: "COASTAL_LANDSCAPE",
    name: "Coastal Landscape",
  },
  {
    id: "HEXELLS",
    name: "Hexells",
  },
  {
    id: "MATRIX 2D",
    name: "Matrix (2D)",
  },
  {
    id: "MATRIX 3D",
    name: "Matrix (3D)",
  },
  {
    id: "SLIDESHOW",
    name: "Picture Slideshow",
  },
  {
    id: "STABLE_DIFFUSION",
    name: "Stable Diffusion (Beta)",
    requiresWebGPU: true,
  },
  {
    id: "VANTA",
    name: "Vanta Waves",
    startsWith: true,
  },
];

export const BASE_CANVAS_SELECTOR = ":scope > canvas";

export const BASE_VIDEO_SELECTOR = ":scope > video";
