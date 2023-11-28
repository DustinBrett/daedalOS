import { type OffscreenRenderProps } from "components/system/Desktop/Wallpapers/types";

export type VantaNetConfig = {
  backgroundColor: any;
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
  maxDistance: number;
  mouseControls?: boolean;
  mouseEase?: boolean;
  points: number;
  showDots?: boolean;
  spacing: number;
  touchControls?: boolean;
  ww: number;
  zoom?: number;
};

type MainThreadRenderProps = {
  el: HTMLElement;
};

type RenderProps = MainThreadRenderProps | OffscreenRenderProps;

type VantaNetSettings = RenderProps &
  VantaNetConfig & {
    THREE?: unknown;
  };

export type VantaNet = {
  destroy: () => void;
  renderer: {
    setSize: (width: number, height: number) => void;
  };
  resize: () => void;
};

export type VantaNetObject = {
  NET: (settings: VantaNetSettings) => VantaNet;
  current: VantaNet;
};

declare global {
  interface Window {
    THREE: unknown;
    VANTA: VantaNetObject;
  }
}
