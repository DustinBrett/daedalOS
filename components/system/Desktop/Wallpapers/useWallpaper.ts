import vantaWaves from "components/system/Desktop/Wallpapers/vantaWaves";
import { config } from "components/system/Desktop/Wallpapers/vantaWaves/config";
import { useFileSystem } from "contexts/fileSystem";
import { useSession } from "contexts/session";
import type { WallpaperFit } from "contexts/session/types";
import useWorker from "hooks/useWorker";
import { useCallback, useEffect } from "react";
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

const WALLPAPERS = new Set(["VANTA"]);

const useWallpaper = (
  desktopRef: React.MutableRefObject<HTMLElement | null>
): void => {
  const { exists, readFile } = useFileSystem();
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
  const vantaWorker = useWorker<void>(
    wallpaperImage === "VANTA" ? vantaWorkerInit : undefined
  );
  const resizeListener = useCallback(
    () =>
      vantaWorker.current?.postMessage(
        desktopRef.current?.getBoundingClientRect()
      ),
    [desktopRef, vantaWorker]
  );
  const loadWallpaper = useCallback(() => {
    if (desktopRef.current) {
      desktopRef.current.setAttribute("style", "");

      if (wallpaperImage === "VANTA") {
        if (
          typeof window.OffscreenCanvas !== "undefined" &&
          vantaWorker.current
        ) {
          const offscreen = createOffscreenCanvas(desktopRef.current);

          vantaWorker.current.postMessage({ canvas: offscreen }, [offscreen]);

          window.removeEventListener("resize", resizeListener);
          window.addEventListener("resize", resizeListener, { passive: true });
        } else {
          vantaWaves(config)(desktopRef.current);
        }
      }
    }
  }, [desktopRef, resizeListener, vantaWorker, wallpaperImage]);
  const loadFileWallpaper = useCallback(async () => {
    if (await exists(wallpaperImage)) {
      const [, currentWallpaperUrl] =
        desktopRef.current?.style.backgroundImage.match(/"(.*?)"/) || [];

      if (currentWallpaperUrl) cleanUpBufferUrl(currentWallpaperUrl);

      if (typeof window.OffscreenCanvas !== "undefined") {
        desktopRef.current?.querySelector("canvas")?.remove();
      } else {
        vantaWaves(config)();
      }

      desktopRef.current?.setAttribute(
        "style",
        `
        background-image: url("${bufferToUrl(await readFile(wallpaperImage))}");
        ${cssFit[wallpaperFit]}
      `
      );
    } else {
      loadWallpaper();
    }
  }, [
    desktopRef,
    exists,
    loadWallpaper,
    readFile,
    wallpaperFit,
    wallpaperImage,
  ]);

  useEffect(() => {
    if (sessionLoaded) {
      if (wallpaperImage && !WALLPAPERS.has(wallpaperImage)) {
        loadFileWallpaper().catch(loadWallpaper);
      } else {
        loadWallpaper();
      }
    }
  }, [loadFileWallpaper, loadWallpaper, sessionLoaded, wallpaperImage]);
};

export default useWallpaper;
