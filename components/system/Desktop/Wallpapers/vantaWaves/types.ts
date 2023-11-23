import { type OffscreenRenderProps } from "components/system/Desktop/Wallpapers/types";

type VantaWavesCycleColor = {
  colorCycleSpeed?: number;
  hue?: number;
  lightness?: number;
  saturation?: number;
};

export type VantaWavesConfig = VantaWavesCycleColor & {
  camera: {
    far: number;
    fov: number;
    near: number;
  };
  color: string;
  forceAnimate?: boolean;
  gyroControls?: boolean;
  hh: number;
  material: {
    options: {
      fog?: boolean;
      wireframe: boolean;
    };
  };
  mouseControls?: boolean;
  mouseEase?: boolean;
  shininess: number;
  touchControls?: boolean;
  waveHeight: number;
  waveSpeed: number;
  ww: number;
  zoom?: number;
};

type MainThreadRenderProps = {
  el: HTMLElement;
};

type RenderProps = MainThreadRenderProps | OffscreenRenderProps;

type VantaWavesSettings = RenderProps &
  VantaWavesConfig & {
    THREE?: unknown;
  };

export type VantaWaves = {
  destroy: () => void;
  renderer: {
    setSize: (width: number, height: number) => void;
  };
  resize: () => void;
};

export type VantaObject = {
  WAVES: (settings: VantaWavesSettings) => VantaWaves;
  current: VantaWaves;
};

declare global {
  interface Window {
    THREE: unknown;
    VANTA: VantaObject;
  }
}
