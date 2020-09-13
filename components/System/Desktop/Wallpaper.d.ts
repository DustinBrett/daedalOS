export type CancelRainbowEffectFunction = () => void;

export type WallpaperEffect = {
  destroy: () => void;
  options: {
    color: number;
  };
};
