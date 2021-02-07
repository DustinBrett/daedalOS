export type VantaWavesSettings = {
  color: number;
  shininess: number;
  waveHeight: number;
  waveSpeed: number;
  zoom: number;
};

export type WallpaperEffect = (
  desktopRef: React.RefObject<HTMLElement>
) => () => void;
