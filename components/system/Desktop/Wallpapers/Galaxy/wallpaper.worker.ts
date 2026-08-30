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
let activeCanvas: OffscreenCanvas | undefined;
let activeConfig: Partial<GalaxyConfig> | undefined;
// Holds a resize that arrived while the context was lost
let pendingSize: { height: number; width: number } | undefined;

const attachRenderer = (): void => {
  if (!activeCanvas) return;

  try {
    renderer = createGalaxyRenderer(activeCanvas, activeConfig);

    if (pendingSize) {
      renderer.resize(pendingSize.width, pendingSize.height);
      pendingSize = undefined;
    }
  } catch (error) {
    globalThis.postMessage({
      message: (error as Error)?.message,
      type: "[error]",
    });
  }
};

// Recover evicted WebGL contexts: preventDefault keeps the context
// restorable, and the renderer is rebuilt once the browser returns it
const handleContextLost = (event: Event): void => {
  event.preventDefault();
  renderer?.destroy();
  renderer = undefined;
};

const handleContextRestored = (): void => attachRenderer();

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
      if (renderer) {
        renderer.resize(data.width * canvasScale, data.height * canvasScale);
      } else {
        pendingSize = {
          height: data.height * canvasScale,
          width: data.width * canvasScale,
        };
      }
    } else if ("canvas" in data && data.canvas) {
      renderer?.destroy();
      canvasScale = data.devicePixelRatio || 1;

      if (activeCanvas !== data.canvas) {
        activeCanvas?.removeEventListener(
          "webglcontextlost",
          handleContextLost
        );
        activeCanvas?.removeEventListener(
          "webglcontextrestored",
          handleContextRestored
        );
        activeCanvas = data.canvas;
        activeCanvas.addEventListener("webglcontextlost", handleContextLost);
        activeCanvas.addEventListener(
          "webglcontextrestored",
          handleContextRestored
        );
      }

      activeConfig = data.config as Partial<GalaxyConfig>;
      attachRenderer();
    } else if ("type" in data) {
      if (data.type === "tilt") renderer?.setTilt(data.x, data.y);
      else if (data.type === "visibility") renderer?.setVisible(data.visible);
    }
  },
  { passive: true }
);
