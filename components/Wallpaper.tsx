import type { RefObject } from 'react';
import * as THREE from 'three';
import WAVES from '@/assets/libs/vanta.waves.min';

const vantaJsSettings = {
  gyroControls: false,
  mouseControls: false,
  touchControls: false,
  color: 0x3c4961,
  shininess: 15,
  waveHeight: 25,
  waveSpeed: 0.5,
  zoom: 0.9
};

export type WallpaperEffect = {
  destroy: () => void;
};

export const renderWallpaperEffect = ({
  current: renderElement
}: RefObject<HTMLElement>): WallpaperEffect =>
  WAVES({
    el: renderElement,
    THREE,
    ...vantaJsSettings
  });
