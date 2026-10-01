import { libs } from "components/system/Desktop/Wallpapers/ShaderToy/CoastalLandscape";
import { type OffscreenRenderProps } from "components/system/Desktop/Wallpapers/types";

declare global {
  var effectInit: (canvas: OffscreenCanvas) => void;
  var updateLandscapeSize: () => void;
  var demoCanvasRect: DOMRect;
  var devicePixelRatio: number;
}

globalThis.addEventListener(
  "message",
  ({ data }: { data: DOMRect | OffscreenRenderProps | string }) => {
    if (typeof WebGLRenderingContext === "undefined") return;

    if (data === "init") {
      globalThis.importScripts(...libs);
    } else if (data instanceof DOMRect) {
      globalThis.demoCanvasRect = data;
      globalThis.updateLandscapeSize();
    } else {
      const { canvas, devicePixelRatio } = data as OffscreenRenderProps;

      globalThis.devicePixelRatio = devicePixelRatio;

      try {
        globalThis.effectInit(canvas);
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
