import colorCycle from 'components/system/Desktop/wallpapers/colorCycle';
import type { VantaWavesConfig } from 'components/system/Desktop/wallpapers/vantaWaves/types';
import { loadFiles } from 'utils/functions';

const disableControls = {
  mouseControls: false,
  touchControls: false
};

const isWebGLAvailable = typeof WebGLRenderingContext !== 'undefined';

const libs = ['/libs/vanta/three.min.js', '/libs/vanta/vanta.waves.min.js'];

const vantaWaves =
  (config: VantaWavesConfig) =>
  (el: HTMLElement | null): void => {
    loadFiles(libs).then(() => {
      const {
        VANTA: { current: currentEffect, WAVES }
      } = window;
      currentEffect?.destroy();

      const vantaEffect =
        el && isWebGLAvailable
          ? WAVES({
              el,
              ...disableControls,
              ...config
            })
          : undefined;

      if (vantaEffect) {
        const { stop: stopColorCycle } = colorCycle(config.color, (color) =>
          vantaEffect.setOptions({ color })
        );

        vantaEffect.onDestroy = stopColorCycle;
      }
    });
  };

export default vantaWaves;
