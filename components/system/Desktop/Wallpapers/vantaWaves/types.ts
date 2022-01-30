type VantaWavesCycleColor = {
  colorCycleSpeed?: number;
  hue?: number;
  lightness?: number;
  saturation?: number;
};

export type VantaWavesConfig = VantaWavesCycleColor & {
  color: number;
  forceAnimate?: boolean;
  gyroControls?: boolean;
  shininess: number;
  mouseControls?: boolean;
  mouseEase?: boolean;
  touchControls?: boolean;
  waveHeight: number;
  waveSpeed: number;
  zoom?: number;
};

export type OffscreenRenderProps = {
  canvas: OffscreenCanvas;
  devicePixelRatio: number;
};

type MainThreadRenderProps = {
  el: HTMLElement;
};

type RenderProps = MainThreadRenderProps | OffscreenRenderProps;

export type VantaWavesSettings = RenderProps &
  VantaWavesConfig & {
    THREE?: unknown;
  };

type VantaWaves = {
  destroy: () => void;
};

export type VantaObject = {
  current: VantaWaves;
  WAVES: (settings: VantaWavesSettings) => VantaWaves;
};

declare global {
  interface Window {
    THREE: unknown;
    VANTA: VantaObject;
  }
}
