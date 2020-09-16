import WAVES from '@/public/libs/vanta.waves.min';

import type { RefObject } from 'react';
import type { WallpaperEffect } from '@/components/System/Desktop/Wallpaper.d';

import * as THREE from 'three';
import Color from 'color';
import { MILLISECONDS_IN_SECOND } from '@/utils/constants';

const wallpaperColor = (h: number): number =>
  Color(`hsl(${h}, 35%, 12%)`).rgbNumber();

const fps = 20,
  updateIntervalInMilliseconds = MILLISECONDS_IN_SECOND / fps,
  initialColor = 200,
  vantaJsSettings = {
    gyroControls: false,
    mouseControls: false,
    touchControls: false,
    color: wallpaperColor(initialColor),
    shininess: 35,
    waveHeight: 15,
    waveSpeed: 0.25,
    zoom: 0.95
  };

const initRainbowEffect = (wallpaperEffect: WallpaperEffect): (() => void) => {
  let then = Date.now(),
    base = initialColor,
    colorUpdateAnimationId: number;

  const updateColor = () => {
    const now = Date.now(),
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

export const renderWallpaperEffect = ({
  current: renderElement
}: RefObject<HTMLElement>): WallpaperEffect => {
  const wallpaperEffect = WAVES({
      el: renderElement,
      THREE,
      ...vantaJsSettings
    }),
    cancelRainbowEffect = initRainbowEffect(wallpaperEffect);

  wallpaperEffect.onDestroy = cancelRainbowEffect;

  return wallpaperEffect;
};
