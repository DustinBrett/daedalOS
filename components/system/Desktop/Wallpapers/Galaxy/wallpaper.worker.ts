import { type GalaxyConfig } from "components/system/Desktop/Wallpapers/Galaxy/config";
import { type GalaxyInputMessage } from "components/system/Desktop/Wallpapers/Galaxy/input";
import {
  createGalaxyRenderer,
  warmGalaxy,
  type GalaxyRenderer,
} from "components/system/Desktop/Wallpapers/Galaxy/renderer";
import { type OffscreenRenderProps } from "components/system/Desktop/Wallpapers/types";

let renderer: GalaxyRenderer | undefined;
let canvasScale = 1;

globalThis.addEventListener(
  "message",
  ({
    data,
  }: {
    data: DOMRect | GalaxyInputMessage | OffscreenRenderProps | string;
  }) => {
    if (typeof WebGLRenderingContext === "undefined") return;

    if (typeof data === "string") {
      // Generate the particle buffers ahead of the canvas handoff
      if (data === "init") warmGalaxy();

      return;
    }

    if (data instanceof DOMRect) {
      // Resize rects arrive in CSS pixels; scale to the backing store
      renderer?.resize(data.width * canvasScale, data.height * canvasScale);
    } else if ("canvas" in data && data.canvas) {
      renderer?.destroy();
      canvasScale = data.devicePixelRatio || 1;

      try {
        renderer = createGalaxyRenderer(
          data.canvas,
          data.config as Partial<GalaxyConfig>
        );
      } catch (error) {
        globalThis.postMessage({
          message: (error as Error)?.message,
          type: "[error]",
        });
      }
    } else if ("type" in data) {
      if (data.type === "tilt") renderer?.setTilt(data.x, data.y);
      else if (data.type === "visibility") renderer?.setVisible(data.visible);
    }
  },
  { passive: true }
);
