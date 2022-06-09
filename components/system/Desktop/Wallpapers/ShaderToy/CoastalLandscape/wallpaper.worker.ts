import { libs } from "components/system/Desktop/Wallpapers/ShaderToy/CoastalLandscape";
import type { OffscreenRenderProps } from "components/system/Desktop/Wallpapers/types";
import { isWebGLAvailable } from "utils/functions";

/* eslint-disable vars-on-top, no-var  */
declare global {
  var effectInit: (canvas: OffscreenCanvas) => void;
  var updateLandscapeSize: () => void;
  var demoCanvasRect: DOMRect;
  var devicePixelRatio: number;
}
/* eslint-enable vars-on-top, no-var */

globalThis.addEventListener(
  "message",
  ({ data }: { data: DOMRect | OffscreenRenderProps | string }) => {
    if (!isWebGLAvailable) return;

    if (data === "init") {
      globalThis.importScripts(...libs);
    } else if (data instanceof DOMRect) {
      globalThis.demoCanvasRect = data;
      globalThis.updateLandscapeSize();
    } else {
      const { canvas, devicePixelRatio } = data as OffscreenRenderProps;

      globalThis.devicePixelRatio = devicePixelRatio;

      globalThis.effectInit(canvas);
    }
  },
  { passive: true }
);
