import * as THREE from 'three';
import type {
  VantaWavesSettings,
  WallpaperEffect
} from 'types/styles/wallpaper';
/* @ts-expect-error No declaration file is required */
import WAVES from 'vanta/dist/vanta.waves.min';

const disableControls = {
  mouseControls: false,
  touchControls: false
};

const isWebGLAvailable = typeof WebGLRenderingContext !== 'undefined';

const vantaWaves = (settings: VantaWavesSettings): WallpaperEffect => (
  element
) => {
  const vantaEffect =
    element && isWebGLAvailable
      ? WAVES({
          el: element,
          THREE,
          ...disableControls,
          ...settings
        })
      : undefined;

  return () => {
    vantaEffect?.destroy?.();
  };
};

export default vantaWaves;
