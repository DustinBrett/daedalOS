type ContentWindow = Window & typeof globalThis;

type GPUContextPrototype = {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  getCurrentTexture: () => unknown;
};

const PATCHED = Symbol.for("readableCanvas.patched");

const RENDERED_AT = Symbol.for("readableCanvas.renderedAt");

type StampedCanvas = (HTMLCanvasElement | OffscreenCanvas) & {
  [RENDERED_AT]?: number;
};

// WebGPU canvases are blank once a frame is shown, so they can only be
// copied in frames they render; undefined for every other canvas
export const canvasRenderedAt = (
  canvas: HTMLCanvasElement
): number | undefined => (canvas as StampedCanvas)[RENDERED_AT];

// Lets the taskbar peek copy app canvases: WebGL keeps its drawing buffer and
// WebGPU canvases record when they render
export const keepCanvasesReadable = (contentWindow: ContentWindow): void => {
  const canvasPrototype = contentWindow.HTMLCanvasElement
    .prototype as HTMLCanvasElement & { [PATCHED]?: boolean };

  if (canvasPrototype[PATCHED]) return;

  canvasPrototype[PATCHED] = true;

  const { getContext: nativeGetContext } = canvasPrototype;

  canvasPrototype.getContext = function getContext(
    this: HTMLCanvasElement,
    contextId: string,
    options?: WebGLContextAttributes
  ) {
    if (
      contextId === "webgl" ||
      contextId === "webgl2" ||
      contextId === "experimental-webgl"
    ) {
      // Chrome renders desynchronized + preserveDrawingBuffer WebGL to the
      // front buffer, so partial frames flicker (e.g. Quake 3 HUD)
      // eslint-disable-next-line no-param-reassign
      options = Object.assign(options || {}, {
        desynchronized: false,
        preserveDrawingBuffer: true,
      });
    }

    return nativeGetContext.call(this, contextId as "webgl", options);
  } as typeof nativeGetContext;

  const gpuPrototype = (
    contentWindow as unknown as {
      GPUCanvasContext?: { prototype: GPUContextPrototype };
    }
  ).GPUCanvasContext?.prototype;

  if (gpuPrototype) {
    const { getCurrentTexture: nativeGetCurrentTexture } = gpuPrototype;

    gpuPrototype.getCurrentTexture = function getCurrentTexture(
      this: GPUContextPrototype
    ) {
      (this.canvas as StampedCanvas)[RENDERED_AT] = performance.now();

      return nativeGetCurrentTexture.call(this);
    };
  }
};
