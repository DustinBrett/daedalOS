import type { RefObject } from 'react';

import * as THREE from 'three';
import NET from '@/assets/libs/vanta.net.min';
import Color from 'color';

type CancelRainbowEffectFunction = () => void;

const wallpaperColor = (h: number): number =>
  Color(`hsl(${h}, 75%, 75%)`).rgbNumber();

const fps = 60,
  updateIntervalInMilliseconds = Number(process.env.millisecondsInSecond) / fps,
  initialColor = Math.floor(Math.random() * Math.floor(360)),
  vantaJsSettings = {
    gyroControls: true,
    mouseControls: false,
    touchControls: false,
    showDots: false,
    points: 12,
    spacing: 20,
    maxDistance: 25,
    backgroundColor: Color(`rgb(42, 42, 42)`).rgbNumber(),
    color: wallpaperColor(initialColor)
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
  const wallpaperEffect = NET({
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
