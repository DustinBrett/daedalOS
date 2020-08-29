import type { RefObject } from 'react';
import * as THREE from 'three';
import WAVES from '@/assets/libs/vanta.waves.min';
import Color from 'color';

type CancelRainbowEffectFunction = () => void;

const wallpaperColor = (h: number): number =>
  Color(`hsl(${h}, 25%, 15%)`).rgbNumber();

const fps = 25,
  updateIntervalInMilliseconds = Number(process.env.millisecondsInSecond) / fps,
  initialColor = 220,
  vantaJsSettings = {
    gyroControls: false,
    mouseControls: false,
    touchControls: false,
    color: wallpaperColor(initialColor),
    shininess: 25,
    waveHeight: 25,
    waveSpeed: 0.25,
    zoom: 1
  };

const initRainbowEffect = (
  wallpaperEffect: WallpaperEffect
): CancelRainbowEffectFunction => {
  let now,
    delta,
    then = Date.now(),
    base = initialColor,
    colorUpdateAnimationId: number;

  const updateColor = () => {
    now = Date.now();
    delta = now - then;

    if (delta > updateIntervalInMilliseconds) {
      base = base > 360 ? 0 : base + 1;
      then = now - (delta % updateIntervalInMilliseconds);
      wallpaperEffect.options.color = wallpaperColor(base);
    }

    colorUpdateAnimationId = requestAnimationFrame(updateColor);
  };

  colorUpdateAnimationId = requestAnimationFrame(updateColor);

  return () => {
    cancelAnimationFrame(colorUpdateAnimationId);
  };
};

export type WallpaperEffect = {
  destroy: () => void;
  options: {
    color: number;
  };
};

export const renderWallpaperEffect = ({
  current: renderElement
}: RefObject<HTMLElement>): WallpaperEffect => {
  const wallpaperEffect = WAVES({
      el: renderElement,
      THREE,
      ...vantaJsSettings
    }),
    cancelRainbowEffect = initRainbowEffect(wallpaperEffect);

  wallpaperEffect.onDestroy = () => {
    cancelRainbowEffect();
  };

  return wallpaperEffect;
};
