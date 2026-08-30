import { type GalaxyConfig } from "components/system/Desktop/Wallpapers/Galaxy/config";
import { listenGalaxyInput } from "components/system/Desktop/Wallpapers/Galaxy/input";
import { type WallpaperConfig } from "components/system/Desktop/Wallpapers/types";

const Galaxy = async (
  el: HTMLElement | null,
  config?: WallpaperConfig,
  fallback?: () => void
): Promise<void> => {
  if (!el || typeof WebGLRenderingContext === "undefined") return;

  try {
    const { createGalaxyRenderer } = await import(
      "components/system/Desktop/Wallpapers/Galaxy/renderer"
    );
    const canvas = document.createElement("canvas");
    const setCanvasSize = (): void => {
      canvas.style.width = `${el.offsetWidth}px`;
      canvas.style.height = `${el.offsetHeight}px`;
    };

    canvas.width = el.offsetWidth;
    canvas.height = el.offsetHeight;
    setCanvasSize();
    canvas.setAttribute("aria-hidden", "true");
    el.append(canvas);

    // `let`, as the renderer is replaced when a lost context is restored
    let renderer = createGalaxyRenderer(
      canvas,
      config as Partial<GalaxyConfig>
    );
    const stopInput = listenGalaxyInput({
      onTilt: (x, y) => renderer.setTilt(x, y),
      onVisibility: (visible) => renderer.setVisible(visible),
    });
    const resizeListener = (): void => {
      setCanvasSize();
      renderer.resize(el.offsetWidth, el.offsetHeight);
    };
    const contextLostListener = (event: Event): void => {
      // preventDefault keeps the evicted context restorable
      event.preventDefault();
      renderer.destroy();
    };
    const contextRestoredListener = (): void => {
      renderer = createGalaxyRenderer(canvas, config as Partial<GalaxyConfig>);
    };

    window.addEventListener("resize", resizeListener, { passive: true });
    canvas.addEventListener("webglcontextlost", contextLostListener);
    canvas.addEventListener("webglcontextrestored", contextRestoredListener);

    window.WallpaperDestroy = () => {
      window.removeEventListener("resize", resizeListener);
      canvas.removeEventListener("webglcontextlost", contextLostListener);
      canvas.removeEventListener(
        "webglcontextrestored",
        contextRestoredListener
      );
      stopInput();
      renderer.destroy();
      window.WallpaperDestroy = undefined;
    };
  } catch {
    fallback?.();
  }
};

export default Galaxy;
