import { type OffscreenRenderProps } from "components/system/Desktop/Wallpapers/types";
import {
  config,
  disableControls,
  libs,
} from "components/system/Desktop/Wallpapers/vantaNet/config";
import {
  type VantaNet,
  type VantaNetConfig,
  type VantaNetObject,
} from "components/system/Desktop/Wallpapers/vantaNet/types";

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var VANTA: VantaNetObject;
}

let netEffect: VantaNet;

globalThis.addEventListener(
  "message",
  ({ data }: { data: DOMRect | OffscreenRenderProps | string }) => {
    if (typeof WebGLRenderingContext === "undefined") return;

    if (data === "init") {
      globalThis.importScripts(...libs);
    } else if (data instanceof DOMRect) {
      const { width, height } = data;

      netEffect?.renderer.setSize(width, height);
      netEffect?.resize();
    } else {
      const {
        canvas,
        config: offscreenConfig,
        devicePixelRatio,
      } = data as OffscreenRenderProps;
      const { VANTA: { current: currentEffect = netEffect, NET } = {} } =
        globalThis;

      if (!canvas || !NET) return;
      if (currentEffect) currentEffect.destroy();

      try {
        netEffect = NET({
          ...((offscreenConfig || config) as VantaNetConfig),
          ...disableControls,
          canvas,
          devicePixelRatio,
        });
      } catch (error) {
        globalThis.postMessage({
          message: (error as Error)?.message,
          type: "[error]",
        });
      }
    }
  },
  { passive: true }
);
