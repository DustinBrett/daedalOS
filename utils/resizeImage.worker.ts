type ResizeImageWorkerData = {
  data: {
    blob: Blob;
    canvas: OffscreenCanvas;
    maxDimension: number;
  };
};

globalThis.addEventListener(
  "message",
  async ({
    data: { blob, canvas, maxDimension },
  }: ResizeImageWorkerData): Promise<void> => {
    if (blob instanceof Blob && canvas instanceof OffscreenCanvas) {
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      const bitmap = await createImageBitmap(blob);

      if (!bitmap) return;

      const offscreenCanvas = canvas;
      const ratio = Math.min(
        maxDimension / bitmap.width,
        maxDimension / bitmap.height
      );
      const dw = Math.round(bitmap.width * ratio);
      const dh = Math.round(bitmap.height * ratio);

      offscreenCanvas.width = dw;
      offscreenCanvas.height = dh;

      ctx.drawImage(bitmap, 0, 0, dw, dh);

      globalThis.postMessage(
        await offscreenCanvas.convertToBlob({ type: "image/png" })
      );
    }
  },
  { passive: true }
);
