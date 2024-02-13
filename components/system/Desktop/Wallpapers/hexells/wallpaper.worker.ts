import { ROOT_PATH, libs } from "components/system/Desktop/Wallpapers/hexells";
import { type OffscreenRenderProps } from "components/system/Desktop/Wallpapers/types";

/* eslint-disable vars-on-top, no-var  */
declare global {
  var Demo: new (canvas: OffscreenCanvas, rootPath: string) => unknown;
  var Hexells: unknown;
  var demoCanvasRect: DOMRect;
  var devicePixelRatio: number;
}
/* eslint-enable vars-on-top, no-var */

globalThis.addEventListener(
  "message",
  ({ data }: { data: DOMRect | OffscreenRenderProps | string }) => {
    if (typeof WebGLRenderingContext === "undefined") return;

    if (data === "init") {
      globalThis.importScripts(...libs);
    } else if (data instanceof DOMRect) {
      globalThis.demoCanvasRect = data;
    } else {
      const { canvas, devicePixelRatio } = data as OffscreenRenderProps;

      globalThis.devicePixelRatio = devicePixelRatio;

      try {
        globalThis.Hexells = new globalThis.Demo(canvas, ROOT_PATH);
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
