export type VantaWavesConfig = {
  color: number;
  shininess: number;
  mouseControls?: boolean;
  touchControls?: boolean;
  waveHeight: number;
  waveSpeed: number;
  zoom: number;
};

type VantaWavesSettings = VantaWavesConfig & {
  el: HTMLElement;
  THREE?: unknown;
};

type VantaWaves = {
  destroy: () => void;
  onDestroy: () => void;
  setOptions: (settings: Partial<VantaWavesConfig>) => void;
};

declare global {
  interface Window {
    THREE: unknown;
    VANTA: {
      current: VantaWaves;
      WAVES: (settings: VantaWavesSettings) => VantaWaves;
    };
  }
}
