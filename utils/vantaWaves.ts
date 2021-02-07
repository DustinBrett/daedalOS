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

const vantaWaves = (settings: VantaWavesSettings): WallpaperEffect => (
  desktopRef: React.RefObject<HTMLElement>
) => {
  const vantaEffect = WAVES({
    el: desktopRef.current,
    THREE,
    ...disableControls,
    ...settings
  });

  return () => {
    vantaEffect?.destroy?.();
  };
};

export default vantaWaves;
