export type VantaWavesSettings = {
  color: number;
  shininess: number;
  waveHeight: number;
  waveSpeed: number;
  zoom: number;
};

export type WallpaperEffect = (element: HTMLElement | null) => () => void;
