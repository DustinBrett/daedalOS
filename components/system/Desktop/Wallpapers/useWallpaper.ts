import vantaWallpaperWorker from "components/system/Desktop/Wallpapers/vantaWaves/vantaWorker";
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
  const vantaWorker = useWorker<void>(vantaWallpaperWorker, "Wallpaper");
  const loadThemeWallpaper = useCallback(() => {
    if (desktopRef.current) {
      desktopRef.current.setAttribute("style", "");

      if (typeof OffscreenCanvas !== "undefined" && vantaWorker) {
        const offscreen = createOffscreenCanvas(desktopRef.current);

        vantaWorker.postMessage({ canvas: offscreen }, [offscreen]);
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

      if (typeof OffscreenCanvas !== "undefined" && vantaWorker) {
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
    vantaWorker,
    wallpaper,
    wallpaperFit,
    wallpaperImage,
  ]);

  useEffect(() => {
    if (sessionLoaded) {
      if (wallpaperImage) {
        try {
          loadFileWallpaper();
        } catch {
          loadThemeWallpaper();
        }
      } else {
        loadThemeWallpaper();
      }
    }
  }, [loadFileWallpaper, loadThemeWallpaper, sessionLoaded, wallpaperImage]);
};

export default useWallpaper;
