import { useFileSystem } from "contexts/fileSystem";
import { useSession } from "contexts/session";
import type { WallpaperFit } from "contexts/session/types";
import useWorker from "hooks/useWorker";
import { useCallback, useEffect } from "react";
import { useTheme } from "styled-components";
import {
  bufferToUrl,
  cleanUpBufferUrl,
  createOffscreenCanvas,
} from "utils/functions";

const cssFit: Record<WallpaperFit, string> = {
  center: "background-repeat: no-repeat;",
  fill: "background-size: cover;",
  fit: `
    background-repeat: no-repeat;
    background-size: contain;
  `,
  stretch: "background-size: 100% 100%;",
  tile: "",
};

const useWallpaper = (
  desktopRef: React.RefObject<HTMLElement | null>
): void => {
  const { exists, readFile } = useFileSystem();
  const { wallpaper } = useTheme();
  const { sessionLoaded, wallpaperImage, wallpaperFit } = useSession();
  const vantaWorkerInit = useCallback(
    () =>
      new Worker(
        new URL(
          "components/system/Desktop/Wallpapers/vantaWaves/wallpaper.worker",
          import.meta.url
        ),
        { name: "Wallpaper" }
      ),
    []
  );
  const vantaWorker = useWorker<void>(vantaWorkerInit);
  const loadThemeWallpaper = useCallback(() => {
    if (desktopRef.current) {
      desktopRef.current.setAttribute("style", "");

      if (typeof OffscreenCanvas !== "undefined" && vantaWorker.current) {
        const offscreen = createOffscreenCanvas(desktopRef.current);

        vantaWorker.current.postMessage({ canvas: offscreen }, [offscreen]);
      } else {
        wallpaper?.(desktopRef.current);
      }
    }
  }, [desktopRef, vantaWorker, wallpaper]);
  const loadFileWallpaper = useCallback(async () => {
    if (await exists(wallpaperImage)) {
      const [, currentWallpaperUrl] =
        desktopRef.current?.style.backgroundImage.match(/"(.*?)"/) || [];

      if (currentWallpaperUrl) cleanUpBufferUrl(currentWallpaperUrl);

      if (typeof OffscreenCanvas !== "undefined") {
        desktopRef.current?.querySelector("canvas")?.remove();
      } else {
        wallpaper?.();
      }

      desktopRef.current?.setAttribute(
        "style",
        `
        background-image: url("${bufferToUrl(await readFile(wallpaperImage))}");
        ${cssFit[wallpaperFit]}
      `
      );
    } else {
      loadThemeWallpaper();
    }
  }, [
    desktopRef,
    exists,
    loadThemeWallpaper,
    readFile,
    wallpaper,
    wallpaperFit,
    wallpaperImage,
  ]);

  useEffect(() => {
    if (sessionLoaded) {
      if (wallpaperImage) {
        loadFileWallpaper().catch(loadThemeWallpaper);
      } else {
        loadThemeWallpaper();
      }
    }
  }, [loadFileWallpaper, loadThemeWallpaper, sessionLoaded, wallpaperImage]);
};

export default useWallpaper;
