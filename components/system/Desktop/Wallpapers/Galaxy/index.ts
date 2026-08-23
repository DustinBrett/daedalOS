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
    el.append(canvas);

    const renderer = createGalaxyRenderer(
      canvas,
      config as Partial<GalaxyConfig>
    );
    const stopInput = listenGalaxyInput({
      onTilt: renderer.setTilt,
      onVisibility: renderer.setVisible,
    });
    const resizeListener = (): void => {
      setCanvasSize();
      renderer.resize(el.offsetWidth, el.offsetHeight);
    };

    window.addEventListener("resize", resizeListener, { passive: true });

    window.WallpaperDestroy = () => {
      window.removeEventListener("resize", resizeListener);
      stopInput();
      renderer.destroy();
      window.WallpaperDestroy = undefined;
    };
  } catch {
    fallback?.();
  }
};

export default Galaxy;
