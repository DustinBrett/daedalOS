import type { RefObject } from 'react';
import * as THREE from 'three';
import WAVES from '@/assets/libs/vanta.waves.min';

const vantaJsSettings = {
  gyroControls: false,
  mouseControls: false,
  touchControls: false,
  shininess: 25,
  waveHeight: 25,
  waveSpeed: 0.25,
  zoom: 1
};

export type WallpaperEffect = {
  destroy: () => void;
  options: {
    color: number;
  };
};

export const renderWallpaperEffect = (
  { current: renderElement }: RefObject<HTMLElement>,
  initialColor: number
): WallpaperEffect =>
  WAVES({
    el: renderElement,
    THREE,
    ...vantaJsSettings,
    color: initialColor
  });
