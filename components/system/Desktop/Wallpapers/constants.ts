import {
  type WallpaperMenuItem,
  type WallpaperFunc,
} from "components/system/Desktop/Wallpapers/types";
import { type WallpaperFit } from "contexts/session/types";

export const bgPositionSize: Record<WallpaperFit, string> = {
  center: "center center",
  fill: "center center / cover",
  fit: "center center / contain",
  stretch: "center center / 100% 100%",
  tile: "50% 50%",
};

export const WALLPAPER_PATHS: Record<
  string,
  () => Promise<{ default: WallpaperFunc; libs: string[] }>
> = {
  COASTAL_LANDSCAPE: () =>
    import("components/system/Desktop/Wallpapers/ShaderToy/CoastalLandscape"),
  HEXELLS: () => import("components/system/Desktop/Wallpapers/hexells"),
  MATRIX: () => import("components/system/Desktop/Wallpapers/Matrix"),
  STABLE_DIFFUSION: () =>
    import("components/system/Desktop/Wallpapers/StableDiffusion"),
  VANTA: () => import("components/system/Desktop/Wallpapers/vantaWaves"),
};

export const WALLPAPER_WORKERS: Record<string, () => Worker> = {
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
  VANTA: (): Worker =>
    new Worker(
      new URL(
        "components/system/Desktop/Wallpapers/vantaWaves/wallpaper.worker",
        import.meta.url
      ),
      { name: "Wallpaper (Vanta Waves)" }
    ),
};

export const WALLPAPER_WORKER_NAMES = Object.keys(WALLPAPER_WORKERS);

export const REDUCED_MOTION_PERCENT = 0.1;

export const WALLPAPER_MENU: WallpaperMenuItem[] = [
  {
    id: "ART_INSTITUTE_OF_CHICAGO",
    name: "Art Institute of Chicago",
  },
  {
    hasAlt: false,
    id: "COASTAL_LANDSCAPE",
    name: "Coastal Landscape",
  },
  {
    hasAlt: false,
    id: "HEXELLS",
    name: "Hexells",
  },
  {
    id: "LOREM_PICSUM",
    name: "Lorem Picsum",
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
    id: "APOD",
    name: "NASA APOD",
  },
  {
    id: "SLIDESHOW",
    name: "Picture Slideshow",
  },
  {
    hasAlt: false,
    id: "STABLE_DIFFUSION",
    name: "Stable Diffusion (beta)",
    requiresWebGPU: true,
  },
  {
    id: "VANTA",
    name: "Vanta Waves",
  },
];

export const BASE_CANVAS_SELECTOR = ":scope > canvas";

export const BASE_VIDEO_SELECTOR = ":scope > video";

export const STABLE_DIFFUSION_DELAY_IN_MIN = 10;

export const PRELOAD_ID = "preloadWallpaper";

export const MAX_RETRIES = 5;
